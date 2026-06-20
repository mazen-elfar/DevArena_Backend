import { getPrisma } from "../../config/database.js";
import { getRedis } from "../../config/redis.js";
import { Errors } from "../../shared/errors/error-definitions.js";

const QUEUE_KEY = "matchmaking:queue";
const RATING_RANGE = 200;

export class MatchmakingService {
  async joinQueue(userId, rating) {
    const prisma = getPrisma();
    const redis = getRedis();

    const existing = await prisma.matchmakingQueue.findFirst({
      where: { userId, status: "QUEUED" },
    });
    if (existing) throw Errors.BadRequest("Already in matchmaking queue");

    const entry = await prisma.matchmakingQueue.create({
      data: { userId, rating, status: "QUEUED" },
    });

    await redis.zadd(QUEUE_KEY, rating, userId);
    return entry;
  }

  async leaveQueue(userId) {
    const prisma = getPrisma();
    const redis = getRedis();

    const entry = await prisma.matchmakingQueue.findFirst({
      where: { userId, status: "QUEUED" },
    });
    if (!entry) throw Errors.NotFound("Matchmaking queue entry");

    await prisma.matchmakingQueue.update({
      where: { id: entry.id },
      data: { status: "EXPIRED" },
    });

    await redis.zrem(QUEUE_KEY, userId);
  }

  async findMatches() {
    const prisma = getPrisma();
    const redis = getRedis();

    const queuedUsers = await redis.zrangebyscore(QUEUE_KEY, "-inf", "+inf", "WITHSCORES");
    const matches = [];
    const processed = new Set();

    for (let i = 0; i < queuedUsers.length; i += 2) {
      const userId = queuedUsers[i];
      const rating = parseInt(queuedUsers[i + 1]);

      if (processed.has(userId)) continue;

      const candidates = await redis.zrangebyscore(
        QUEUE_KEY,
        rating - RATING_RANGE,
        rating + RATING_RANGE,
      );

      const opponentId = candidates.find((c) => c !== userId && !processed.has(c));
      if (!opponentId) continue;

      processed.add(userId);
      processed.add(opponentId);

      const battle = await prisma.$transaction(async (tx) => {
        const b = await tx.battle.create({
          data: {
            mode: "RANKED",
            questId: await this._pickRandomQuest(tx),
            status: "WAITING",
          },
        });

        await tx.battlePlayer.createMany({
          data: [
            { battleId: b.id, userId },
            { battleId: b.id, userId: opponentId },
          ],
        });

        await tx.matchmakingQueue.updateMany({
          where: { userId: { in: [userId, opponentId] }, status: "QUEUED" },
          data: { status: "MATCHED" },
        });

        return b;
      });

      await redis.zrem(QUEUE_KEY, userId, opponentId);
      matches.push(battle);
    }

    return matches;
  }

  async _pickRandomQuest(tx) {
    const quest = await tx.quest.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      skip: Math.floor(Math.random() * 10),
    });
    if (!quest) throw Errors.BadRequest("No active quests available");
    return quest.id;
  }
}
