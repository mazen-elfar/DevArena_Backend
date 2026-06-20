import { getPrisma } from "../../config/database.js";
import { getRedis } from "../../config/redis.js";
import { Errors } from "../../shared/errors/error-definitions.js";
import { MatchmakingService } from "./matchmaking.service.js";

const matchmakingService = new MatchmakingService();

export class BattlesService {
  async createBattle(userId, { mode, questId, opponentId, aiDifficulty }) {
    const prisma = getPrisma();

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) throw Errors.NotFound("Quest");

    if (mode === "RANKED") {
      const profile = await prisma.profile.findUnique({ where: { userId } });
      return matchmakingService.joinQueue(userId, profile?.rating ?? 1000);
    }

    const battleData = { mode, questId, status: "WAITING", aiDifficulty };

    if (mode === "FRIEND") {
      if (!opponentId) throw Errors.BadRequest("opponentId required for FRIEND mode");
      const opponent = await prisma.user.findUnique({ where: { id: opponentId } });
      if (!opponent || opponent.deletedAt) throw Errors.NotFound("Opponent");
    }

    const battle = await prisma.battle.create({ data: battleData });

    await prisma.battlePlayer.create({
      data: { battleId: battle.id, userId },
    });

    if (opponentId) {
      await prisma.battlePlayer.create({
        data: { battleId: battle.id, userId: opponentId },
      });
      if (mode !== "AI") {
        await prisma.battle.update({
          where: { id: battle.id },
          data: { status: "IN_PROGRESS", startedAt: new Date() },
        });
      }
    }

    return battle;
  }

  async joinBattle(battleId, userId) {
    const prisma = getPrisma();

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: { players: true },
    });
    if (!battle) throw Errors.NotFound("Battle");
    if (battle.status !== "WAITING") throw Errors.BadRequest("Battle is not waiting for players");
    if (battle.players.length >= 2) throw Errors.BadRequest("Battle is full");

    const alreadyJoined = battle.players.some((p) => p.userId === userId);
    if (alreadyJoined) throw Errors.Conflict("Already joined this battle");

    await prisma.battlePlayer.create({
      data: { battleId, userId },
    });

    if (battle.players.length + 1 >= 2) {
      await prisma.battle.update({
        where: { id: battleId },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });
    }

    return prisma.battle.findUnique({
      where: { id: battleId },
      include: { players: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } } },
    });
  }

  async submitCode(battleId, userId, { sourceCode, language }) {
    const prisma = getPrisma();

    const battle = await prisma.battle.findUnique({ where: { id: battleId } });
    if (!battle) throw Errors.NotFound("Battle");
    if (battle.status !== "IN_PROGRESS") throw Errors.BadRequest("Battle is not in progress");

    const isPlayer = await prisma.battlePlayer.findFirst({
      where: { battleId, userId },
    });
    if (!isPlayer) throw Errors.Forbidden("Not a player in this battle");

    const submission = await prisma.battleSubmission.create({
      data: {
        battleId,
        userId,
        sourceCode,
        language,
        status: "PENDING",
      },
    });

    return submission;
  }

  async getBattle(battleId) {
    const prisma = getPrisma();

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        quest: { select: { id: true, title: true, difficulty: true } },
        players: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        },
        battleSubmissions: {
          include: { user: { select: { id: true, username: true } } },
          orderBy: { submittedAt: "desc" },
        },
      },
    });
    if (!battle) throw Errors.NotFound("Battle");
    return battle;
  }

  async listBattles(userId, { page, limit }) {
    const prisma = getPrisma();
    const where = { players: { some: { userId } } };

    const [items, total] = await Promise.all([
      prisma.battle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          quest: { select: { id: true, title: true, difficulty: true } },
          players: {
            include: { user: { select: { id: true, username: true, avatarUrl: true } } },
          },
        },
      }),
      prisma.battle.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getLeaderboard({ page, limit }) {
    const prisma = getPrisma();

    const [items, total] = await Promise.all([
      prisma.profile.findMany({
        orderBy: { rating: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      }),
      prisma.profile.count(),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }
}
