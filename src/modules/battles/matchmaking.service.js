import { getPrisma } from "../../config/database.js";
import { getRedis } from "../../config/redis.js";
import { Errors } from "../../shared/errors/error-definitions.js";

const QUEUE_KEY = "matchmaking:queue";
const RATING_RANGE = 200;
const QUEUE_TTL_MS = 120_000;

export class MatchmakingService {
  async joinQueue(userId, rating) {
    const prisma = getPrisma();

    const existing = await prisma.matchmakingQueue.findFirst({
      where: { userId, status: "QUEUED" },
    });
    if (existing) throw Errors.BadRequest("Already in matchmaking queue");

    const entry = await prisma.matchmakingQueue.create({
      data: { userId, rating, status: "QUEUED" },
    });

    try {
      const redis = getRedis();
      await redis.zadd(QUEUE_KEY, rating, userId);
    } catch {
      // Redis unavailable — database-only mode
    }

    return entry;
  }

  async leaveQueue(userId) {
    const prisma = getPrisma();

    const entry = await prisma.matchmakingQueue.findFirst({
      where: { userId, status: "QUEUED" },
    });
    if (!entry) throw Errors.NotFound("Matchmaking queue entry");

    await prisma.matchmakingQueue.update({
      where: { id: entry.id },
      data: { status: "EXPIRED" },
    });

    try {
      const redis = getRedis();
      await redis.zrem(QUEUE_KEY, userId);
    } catch {
      // Redis unavailable — database-only mode
    }
  }

  async findMatches() {
    const prisma = getPrisma();
    const now = new Date();
    const expirationCutoff = new Date(now.getTime() - QUEUE_TTL_MS);

    const expired = await prisma.matchmakingQueue.updateMany({
      where: {
        status: "QUEUED",
        joinedAt: { lt: expirationCutoff },
      },
      data: { status: "EXPIRED" },
    });

    const queuedUsers = await prisma.matchmakingQueue.findMany({
      where: { status: "QUEUED" },
      orderBy: { rating: "asc" },
    });

    const battles = [];
    const processed = new Set();

    for (const candidate of queuedUsers) {
      if (processed.has(candidate.userId)) continue;

      const opponent = queuedUsers.find(
        (u) =>
          !processed.has(u.userId) &&
          u.userId !== candidate.userId &&
          Math.abs(u.rating - candidate.rating) <= RATING_RANGE,
      );

      if (!opponent) continue;

      processed.add(candidate.userId);
      processed.add(opponent.userId);

      const battle = await prisma.$transaction(async (tx) => {
        const questId = await this._pickRandomQuest(tx);

        const battle = await tx.battle.create({
          data: {
            mode: "RANKED",
            questId,
            status: "IN_PROGRESS",
            startedAt: now,
          },
        });

        await tx.battlePlayer.createMany({
          data: [
            { battleId: battle.id, userId: candidate.userId },
            { battleId: battle.id, userId: opponent.userId },
          ],
        });

        await tx.matchmakingQueue.updateMany({
          where: {
            userId: { in: [candidate.userId, opponent.userId] },
            status: "QUEUED",
          },
          data: { status: "MATCHED" },
        });

        return battle;
      });

      try {
        const redis = getRedis();
        await redis.zrem(QUEUE_KEY, candidate.userId, opponent.userId);
      } catch {
        // Redis unavailable — database-only mode
      }

      battles.push(battle);
    }

    return battles;
  }

  async getQueueStatus(userId) {
    const prisma = getPrisma();

    const entry = await prisma.matchmakingQueue.findFirst({
      where: { userId, status: "QUEUED" },
    });
    if (!entry) return null;

    const now = new Date();
    const ageMs = now.getTime() - entry.joinedAt.getTime();
    const expired = ageMs >= QUEUE_TTL_MS;

    if (expired) {
      await prisma.matchmakingQueue.update({
        where: { id: entry.id },
        data: { status: "EXPIRED" },
      });
      return null;
    }

    const higherCount = await prisma.matchmakingQueue.count({
      where: {
        status: "QUEUED",
        rating: { gt: entry.rating },
      },
    });

    const position = higherCount + 1;
    const ttlRemaining = Math.ceil((QUEUE_TTL_MS - ageMs) / 1000);

    return {
      status: entry.status,
      rating: entry.rating,
      position,
      joinedAt: entry.joinedAt,
      ttlRemaining,
    };
  }

  async _pickRandomQuest(tx) {
    const count = await tx.quest.count({ where: { isActive: true } });
    if (count === 0) throw Errors.BadRequest("No active quests available");

    const skip = Math.floor(Math.random() * count);

    const quest = await tx.quest.findFirst({
      where: { isActive: true },
      skip,
      take: 1,
    });

    return quest.id;
  }
}
