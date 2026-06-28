import { randomUUID } from "crypto";
import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";
import { MatchmakingService } from "./matchmaking.service.js";

const matchmakingService = new MatchmakingService();

const PROFILE_SELECT = {
  select: {
    id: true,
    username: true,
    displayName: true,
    avatar: true,
    rating: true,
    level: true,
  },
};

const XP_CONFIG = {
  winner: { base: 50, difficultyBonus: { EASY: 10, MEDIUM: 20, HARD: 30, LEGENDARY: 50 } },
  loser: { base: 15 },
  practice: { base: 10 },
};

export class BattlesService {
  async createBattle(userId, { mode, questId, opponentId, aiDifficulty }) {
    const prisma = getPrisma();

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) throw Errors.NotFound("Quest");

    const creatorProfile = await prisma.profile.findUnique({ where: { id: userId } });
    if (!creatorProfile) throw Errors.NotFound("Profile");

    if (mode === "RANKED") {
      return matchmakingService.joinQueue(userId, creatorProfile.rating ?? 1000);
    }

    if (mode === "FRIEND") {
      if (!opponentId) throw Errors.BadRequest("opponentId is required for FRIEND mode");
      if (opponentId === userId) throw Errors.BadRequest("Cannot battle yourself");
      const opponentProfile = await prisma.profile.findUnique({ where: { id: opponentId } });
      if (!opponentProfile) throw Errors.NotFound("Opponent profile");
    }

    if (mode === "AI") {
      if (!aiDifficulty) throw Errors.BadRequest("aiDifficulty is required for AI mode");
    }

    const battle = await prisma.battle.create({
      data: {
        mode,
        questId,
        status: "WAITING",
        aiDifficulty: mode === "AI" ? aiDifficulty : null,
      },
    });

    await prisma.battlePlayer.create({
      data: { battleId: battle.id, userId },
    });

    if (mode === "FRIEND" && opponentId) {
      await prisma.battlePlayer.create({
        data: { battleId: battle.id, userId: opponentId },
      });
      await prisma.battle.update({
        where: { id: battle.id },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });
    }

    if (mode === "AI") {
      const aiProfile = await this._getOrCreateAiProfile(prisma);
      await prisma.battlePlayer.create({
        data: { battleId: battle.id, userId: aiProfile.id },
      });
      await prisma.battle.update({
        where: { id: battle.id },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });
    }

    if (mode === "PRACTICE" || mode === "CLASSIC") {
      await prisma.battle.update({
        where: { id: battle.id },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });
    }

    return prisma.battle.findUnique({
      where: { id: battle.id },
      include: {
        quest: { select: { id: true, title: true, difficulty: true } },
        players: { include: { user: PROFILE_SELECT } },
      },
    });
  }

  async joinBattle(battleId, userId) {
    const prisma = getPrisma();

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: { players: true },
    });
    if (!battle) throw Errors.NotFound("Battle");
    if (battle.status !== "WAITING") throw Errors.BadRequest("Battle is not accepting players");
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
      include: {
        quest: { select: { id: true, title: true, difficulty: true } },
        players: { include: { user: PROFILE_SELECT } },
      },
    });
  }

  async leaveBattle(battleId, userId) {
    const prisma = getPrisma();

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: { players: true },
    });
    if (!battle) throw Errors.NotFound("Battle");

    const player = battle.players.find((p) => p.userId === userId);
    if (!player) throw Errors.Forbidden("Not a player in this battle");

    if (battle.status === "COMPLETED" || battle.status === "CANCELLED") {
      throw Errors.BadRequest("Battle has already ended");
    }

    await prisma.battlePlayer.delete({
      where: { id: player.id },
    });

    const remainingPlayers = battle.players.length - 1;

    if (remainingPlayers === 0) {
      await prisma.battle.update({
        where: { id: battleId },
        data: { status: "CANCELLED", endedAt: new Date() },
      });
    } else if (remainingPlayers === 1 && battle.status === "WAITING") {
      await prisma.battle.update({
        where: { id: battleId },
        data: { status: "CANCELLED", endedAt: new Date() },
      });
    }

    return { success: true, battleId, remainingPlayers };
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

  async completeBattle(battleId) {
    const prisma = getPrisma();

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        players: true,
        quest: true,
        battleSubmissions: true,
      },
    });
    if (!battle) throw Errors.NotFound("Battle");
    if (battle.status !== "IN_PROGRESS") throw Errors.BadRequest("Battle is not in progress");

    return this._finalizeBattle(battle);
  }

  async cancelBattle(battleId) {
    const prisma = getPrisma();

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: { players: true },
    });
    if (!battle) throw Errors.NotFound("Battle");

    if (battle.status === "COMPLETED") {
      throw Errors.BadRequest("Battle is already completed");
    }

    if (battle.status === "CANCELLED") {
      throw Errors.BadRequest("Battle is already cancelled");
    }

    await prisma.battle.update({
      where: { id: battleId },
      data: { status: "CANCELLED", endedAt: new Date() },
    });

    return { id: battleId, status: "CANCELLED" };
  }

  async getBattle(battleId) {
    const prisma = getPrisma();

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        quest: { select: { id: true, title: true, difficulty: true } },
        players: { include: { user: PROFILE_SELECT } },
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
          players: { include: { user: PROFILE_SELECT } },
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
        select: {
          id: true,
          userId: true,
          username: true,
          displayName: true,
          avatar: true,
          rating: true,
          level: true,
        },
      }),
      prisma.profile.count(),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getBattleResults(battleId) {
    const prisma = getPrisma();

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        quest: { select: { id: true, title: true, difficulty: true } },
        players: { include: { user: PROFILE_SELECT } },
        battleSubmissions: {
          include: { user: { select: { id: true, username: true } } },
          orderBy: { submittedAt: "desc" },
        },
        winner: PROFILE_SELECT,
      },
    });
    if (!battle) throw Errors.NotFound("Battle");
    if (battle.status !== "COMPLETED") {
      throw Errors.BadRequest("Battle has not been completed yet");
    }

    const playerIds = battle.players.map((p) => p.userId);

    const [xpLogs, rankHistory] = await Promise.all([
      prisma.xpLog.findMany({
        where: {
          profileId: { in: playerIds },
          referenceId: battleId,
          source: "BATTLE",
        },
      }),
      prisma.userRankHistory.findMany({
        where: { profileId: { in: playerIds } },
        orderBy: { changedAt: "desc" },
        take: playerIds.length * 2,
        include: { rank: true },
      }),
    ]);

    return { battle, xpLogs, rankHistory };
  }

  // ── Private Methods ──────────────────────────────────────

  async _finalizeBattle(battle) {
    const prisma = getPrisma();
    const { players, battleSubmissions, mode, quest, id: battleId } = battle;

    const winnerId = this._determineWinner(players, battleSubmissions);

    await prisma.battle.update({
      where: { id: battleId },
      data: { status: "COMPLETED", endedAt: new Date(), winnerId },
    });

    if (winnerId) {
      await prisma.battlePlayer.updateMany({
        where: { battleId, userId: winnerId },
        data: { isWinner: true },
      });
    }

    const profiles = await prisma.profile.findMany({
      where: { id: { in: players.map((p) => p.userId) } },
    });
    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    const xpAwards = [];
    const ratingChanges = [];

    const humanPlayerIds = players
      .filter((p) => !this._isAiProfile(profileMap.get(p.userId)))
      .map((p) => p.userId);

    const shouldUpdateRating =
      mode !== "PRACTICE" &&
      mode !== "AI" &&
      humanPlayerIds.length >= 2 &&
      winnerId !== null;

    if (shouldUpdateRating) {
      const humanPlayers = players.filter(
        (p) => !this._isAiProfile(profileMap.get(p.userId)),
      );

      const isDraw = winnerId === null;
      if (!isDraw) {
        const ratingResult = await this._updatePairRating(
          humanPlayers[0].userId,
          humanPlayers[1].userId,
          winnerId,
          profileMap,
        );
        ratingChanges.push(ratingResult);
      }
    }

    for (const player of players) {
      const profile = profileMap.get(player.userId);
      if (!profile || this._isAiProfile(profile)) continue;

      const isWinner = player.userId === winnerId;
      const xpResult = await this._awardXp(
        player.userId,
        mode,
        isWinner,
        quest,
        battleId,
      );
      xpAwards.push(xpResult);
    }

    const updatedBattle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        quest: { select: { id: true, title: true, difficulty: true } },
        players: { include: { user: PROFILE_SELECT } },
        winner: PROFILE_SELECT,
      },
    });

    return {
      battle: updatedBattle,
      winnerId,
      xpAwards,
      ratingChanges,
    };
  }

  _determineWinner(players, submissions) {
    if (players.length < 2) return null;

    const bestAcceptedByUser = new Map();

    for (const sub of submissions) {
      if (sub.status !== "ACCEPTED") continue;
      const existing = bestAcceptedByUser.get(sub.userId);
      if (!existing || (sub.runtimeMs ?? Infinity) < (existing.runtimeMs ?? Infinity)) {
        bestAcceptedByUser.set(sub.userId, sub);
      }
    }

    if (bestAcceptedByUser.size === 0) return null;

    let winnerId = null;
    let bestPassed = -1;
    let bestRuntime = Infinity;

    for (const [userId, sub] of bestAcceptedByUser) {
      const passed = this._countPassedTests(sub.testResults);
      const runtime = sub.runtimeMs ?? Infinity;

      if (passed > bestPassed || (passed === bestPassed && runtime < bestRuntime)) {
        bestPassed = passed;
        bestRuntime = runtime;
        winnerId = userId;
      }
    }

    if (bestAcceptedByUser.size === 1) {
      return winnerId;
    }

    const topPassed = bestPassed;
    const tied = [...bestAcceptedByUser.entries()].filter(
      ([, sub]) => this._countPassedTests(sub.testResults) === topPassed,
    );

    if (tied.length === 1) {
      return tied[0][0];
    }

    return tied.sort(
      (a, b) => (a[1].runtimeMs ?? Infinity) - (b[1].runtimeMs ?? Infinity),
    )[0][0];
  }

  _countPassedTests(testResults) {
    if (!testResults || !Array.isArray(testResults)) return 0;
    return testResults.filter((t) => t.passed === true).length;
  }

  _calculateElo(winnerRating, loserRating, winnerGames, loserGames) {
    const kFactor = (games) => {
      if (games < 30) return 40;
      if (games <= 100) return 25;
      return 15;
    };

    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

    const kWinner = kFactor(winnerGames);
    const kLoser = kFactor(loserGames);

    const newWinnerRating = Math.max(
      0,
      Math.round(winnerRating + kWinner * (1 - expectedWinner)),
    );
    const newLoserRating = Math.max(
      0,
      Math.round(loserRating + kLoser * (0 - expectedLoser)),
    );

    return {
      newWinnerRating,
      newLoserRating,
      winnerChange: newWinnerRating - winnerRating,
      loserChange: newLoserRating - loserRating,
    };
  }

  async _updatePairRating(player1Id, player2Id, winnerId, profileMap) {
    const prisma = getPrisma();

    const actualWinnerId =
      winnerId === player1Id || winnerId === player2Id ? winnerId : player1Id;
    const actualLoserId = actualWinnerId === player1Id ? player2Id : player1Id;

    const winnerProfile = profileMap.get(actualWinnerId);
    const loserProfile = profileMap.get(actualLoserId);

    if (!winnerProfile || !loserProfile) {
      return {
        winner: { profileId: actualWinnerId, oldRating: 0, newRating: 0, change: 0 },
        loser: { profileId: actualLoserId, oldRating: 0, newRating: 0, change: 0 },
      };
    }

    const oldWinnerRating = winnerProfile.rating;
    const oldLoserRating = loserProfile.rating;

    const [winnerGames, loserGames] = await Promise.all([
      prisma.battlePlayer.count({
        where: { userId: actualWinnerId, battle: { status: "COMPLETED" } },
      }),
      prisma.battlePlayer.count({
        where: { userId: actualLoserId, battle: { status: "COMPLETED" } },
      }),
    ]);

    const { newWinnerRating, newLoserRating, winnerChange, loserChange } =
      this._calculateElo(oldWinnerRating, oldLoserRating, winnerGames, loserGames);

    await Promise.all([
      prisma.profile.update({
        where: { id: actualWinnerId },
        data: { rating: newWinnerRating },
      }),
      prisma.profile.update({
        where: { id: actualLoserId },
        data: { rating: newLoserRating },
      }),
    ]);

    const [winnerRank, loserRank] = await Promise.all([
      prisma.rank.findFirst({
        where: { minRating: { lte: newWinnerRating }, maxRating: { gte: newWinnerRating } },
      }),
      prisma.rank.findFirst({
        where: { minRating: { lte: newLoserRating }, maxRating: { gte: newLoserRating } },
      }),
    ]);

    await prisma.userRankHistory.createMany({
      data: [
        {
          profileId: actualWinnerId,
          rankId: winnerRank?.id ?? null,
          oldRating: oldWinnerRating,
          newRating: newWinnerRating,
        },
        {
          profileId: actualLoserId,
          rankId: loserRank?.id ?? null,
          oldRating: oldLoserRating,
          newRating: newLoserRating,
        },
      ],
    });

    return {
      winner: {
        profileId: actualWinnerId,
        oldRating: oldWinnerRating,
        newRating: newWinnerRating,
        change: winnerChange,
      },
      loser: {
        profileId: actualLoserId,
        oldRating: oldLoserRating,
        newRating: newLoserRating,
        change: loserChange,
      },
    };
  }

  async _awardXp(profileId, mode, isWinner, quest, battleId) {
    const prisma = getPrisma();

    let xpAmount;
    if (mode === "PRACTICE") {
      xpAmount = XP_CONFIG.practice.base;
    } else if (isWinner) {
      xpAmount =
        XP_CONFIG.winner.base +
        (XP_CONFIG.winner.difficultyBonus[quest.difficulty] ?? 0);
    } else {
      xpAmount = XP_CONFIG.loser.base;
    }

    const description = isWinner
      ? `Won battle on "${quest.title}" (${quest.difficulty})`
      : `Participated in battle on "${quest.title}"`;

    const xpLog = await prisma.xpLog.create({
      data: {
        profileId,
        amount: xpAmount,
        source: "BATTLE",
        description,
        referenceId: battleId,
      },
    });

    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: {
        currentXP: { increment: BigInt(xpAmount) },
        totalXP: { increment: BigInt(xpAmount) },
      },
    });

    return {
      profileId,
      xpAwarded: xpAmount,
      newTotalXP: Number(updatedProfile.totalXP),
      xpLogId: xpLog.id,
    };
  }

  _isAiProfile(profile) {
    if (!profile) return false;
    return profile.username?.startsWith("ai_bot_") ?? false;
  }

  async _getOrCreateAiProfile(prisma) {
    const existing = await prisma.profile.findFirst({
      where: { username: { startsWith: "ai_bot_" } },
      orderBy: { username: "asc" },
    });
    if (existing) return existing;

    const aiUserId = randomUUID();
    const aiProfileId = randomUUID();

    await prisma.user.create({
      data: {
        id: aiUserId,
        email: `ai_bot_${aiUserId.slice(0, 8)}@devbattle.internal`,
        emailVerified: true,
      },
    });

    return prisma.profile.create({
      data: {
        id: aiProfileId,
        userId: aiUserId,
        username: `ai_bot_${aiUserId.slice(0, 8)}`,
        displayName: "AI Bot",
        rating: 1000,
        level: 1,
      },
    });
  }
}
