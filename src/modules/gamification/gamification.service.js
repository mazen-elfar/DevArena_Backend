import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class GamificationService {
  async addXp(userId, amount, source, description, referenceId) {
    const prisma = getPrisma();
    if (amount <= 0) throw Errors.BadRequest("XP amount must be positive");

    const [xpLog, user] = await prisma.$transaction([
      prisma.xpLog.create({
        data: { userId, amount, source, description, referenceId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: amount } },
      }),
    ]);

    const newLevel = Math.floor(Math.sqrt(Number(user.xp) / 100)) + 1;
    if (newLevel > user.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
    }

    return { xpLog, newXp: Number(user.xp) + amount, newLevel };
  }

  async checkAchievements(userId) {
    const prisma = getPrisma();

    const [achievements, userStats, existingIds] = await Promise.all([
      prisma.achievement.findMany({ where: { isActive: true } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          xp: true,
          level: true,
          coins: true,
          submissions: { select: { id: true } },
          battlePlayers: { select: { id: true } },
          userAchievements: { select: { achievementId: true } },
        },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
    ]);

    if (!userStats) throw Errors.NotFound("User");

    const unlockedSet = new Set(existingIds.map((e) => e.achievementId));
    const newlyUnlocked = [];

    const stats = {
      xp: Number(userStats.xp),
      level: userStats.level,
      coins: Number(userStats.coins),
      questsCompleted: userStats.submissions.length,
      battlesPlayed: userStats.battlePlayers.length,
    };

    for (const achievement of achievements) {
      if (unlockedSet.has(achievement.id)) continue;
      if (this._checkCondition(achievement.condition, stats)) {
        newlyUnlocked.push(achievement);
      }
    }

    if (newlyUnlocked.length > 0) {
      await prisma.userAchievement.createMany({
        data: newlyUnlocked.map((a) => ({ userId, achievementId: a.id })),
      });

      for (const achievement of newlyUnlocked) {
        if (achievement.xpReward > 0) {
          await this.addXp(userId, achievement.xpReward, "ACHIEVEMENT", achievement.name);
        }
      }
    }

    return { unlocked: newlyUnlocked };
  }

  _checkCondition(condition, stats) {
    for (const [key, value] of Object.entries(condition)) {
      if (key === "minXp" && stats.xp < value) return false;
      if (key === "minLevel" && stats.level < value) return false;
      if (key === "minCoins" && stats.coins < value) return false;
      if (key === "minQuests" && stats.questsCompleted < value) return false;
      if (key === "minBattles" && stats.battlesPlayed < value) return false;
    }
    return true;
  }

  async getAchievements({ page, limit, category }) {
    const prisma = getPrisma();
    const where = { isActive: true };
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      prisma.achievement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.achievement.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getUserAchievements(userId) {
    const prisma = getPrisma();
    return prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    });
  }

  async getTitles() {
    const prisma = getPrisma();
    return prisma.title.findMany({ orderBy: { name: "asc" } });
  }

  async getUserTitles(userId) {
    const prisma = getPrisma();
    return prisma.userTitle.findMany({
      where: { userId },
      include: { title: true },
    });
  }

  async equipTitle(userId, titleId) {
    const prisma = getPrisma();

    const owned = await prisma.userTitle.findUnique({
      where: { userId_titleId: { userId, titleId } },
    });
    if (!owned) throw Errors.NotFound("Title not unlocked");

    await prisma.$transaction([
      prisma.userTitle.updateMany({
        where: { userId, equipped: true },
        data: { equipped: false },
      }),
      prisma.userTitle.update({
        where: { userId_titleId: { userId, titleId } },
        data: { equipped: true },
      }),
    ]);

    return { titleId, equipped: true };
  }

  async getStreaks(userId) {
    const prisma = getPrisma();
    return prisma.streak.findMany({
      where: { userId },
      orderBy: { type: "asc" },
    });
  }

  async updateStreak(userId, type) {
    const prisma = getPrisma();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.streak.findUnique({
      where: { userId_type: { userId, type } },
    });

    if (!streak) {
      return prisma.streak.create({
        data: {
          userId,
          type,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        },
      });
    }

    const lastActive = new Date(streak.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return streak;
    }

    if (diffDays > 1) {
      const newStreak = await prisma.streak.update({
        where: { userId_type: { userId, type } },
        data: {
          currentStreak: 1,
          lastActiveDate: today,
        },
      });
      return newStreak;
    }

    const newCurrent = streak.currentStreak + 1;
    const newLongest = Math.max(streak.longestStreak, newCurrent);

    return prisma.streak.update({
      where: { userId_type: { userId, type } },
      data: {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastActiveDate: today,
      },
    });
  }

  async addCoins(userId, amount, reason, referenceType, referenceId) {
    const prisma = getPrisma();
    if (amount === 0) throw Errors.BadRequest("Amount cannot be zero");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Errors.NotFound("User");

    const newBalance = Number(user.coins) + amount;
    if (newBalance < 0) throw Errors.BadRequest("Insufficient coins");

    const [transaction, updatedUser] = await prisma.$transaction([
      prisma.coinTransaction.create({
        data: {
          userId,
          amount,
          balanceAfter: BigInt(newBalance),
          reason,
          referenceType,
          referenceId,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { coins: newBalance },
      }),
    ]);

    return { transaction, newBalance };
  }

  async getCoinBalance(userId) {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });
    if (!user) throw Errors.NotFound("User");
    return { coins: Number(user.coins) };
  }

  async getCoinHistory(userId, { page, limit }) {
    const prisma = getPrisma();
    const where = { userId };

    const [items, total] = await Promise.all([
      prisma.coinTransaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.coinTransaction.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }
}
