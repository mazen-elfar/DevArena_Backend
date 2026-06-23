import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class GamificationService {
  async addXp(profileId, amount, source, description, referenceId) {
    const prisma = getPrisma();
    if (amount <= 0) throw Errors.BadRequest("XP amount must be positive");

    const [xpLog, profile] = await prisma.$transaction([
      prisma.xpLog.create({
        data: { profileId, amount, source, description, referenceId },
      }),
      prisma.profile.update({
        where: { id: profileId },
        data: {
          currentXP: { increment: amount },
          totalXP: { increment: amount },
        },
      }),
    ]);

    const newLevel = Math.floor(Math.sqrt(Number(profile.totalXP) / 100)) + 1;
    if (newLevel > profile.level) {
      await prisma.profile.update({
        where: { id: profileId },
        data: { level: newLevel },
      });
    }

    return { xpLog, newXp: Number(profile.totalXP) + amount, newLevel };
  }

  async checkAchievements(profileId) {
    const prisma = getPrisma();

    const [achievements, profileStats, existingAchievementIds] = await Promise.all([
      prisma.achievement.findMany(),
      prisma.profile.findUnique({
        where: { id: profileId },
        select: {
          totalXP: true,
          level: true,
          submissions: { select: { id: true } },
          battlePlayers: { select: { id: true } },
        },
      }),
      prisma.userAchievement.findMany({
        where: { profileId },
        select: { achievementId: true },
      }),
    ]);

    if (!profileStats) throw Errors.NotFound("Profile");

    const unlockedSet = new Set(existingAchievementIds.map((e) => e.achievementId));
    const newlyUnlocked = [];

    const stats = {
      xp: Number(profileStats.totalXP),
      level: profileStats.level,
      questsCompleted: profileStats.submissions.length,
      battlesPlayed: profileStats.battlePlayers.length,
    };

    for (const achievement of achievements) {
      if (unlockedSet.has(achievement.id)) continue;
      if (this._checkCondition(achievement, stats)) {
        newlyUnlocked.push(achievement);
      }
    }

    if (newlyUnlocked.length > 0) {
      await prisma.userAchievement.createMany({
        data: newlyUnlocked.map((a) => ({ profileId, achievementId: a.id })),
      });

      for (const achievement of newlyUnlocked) {
        if (achievement.xpReward > 0) {
          await this.addXp(profileId, achievement.xpReward, "ACHIEVEMENT", achievement.name);
        }
      }
    }

    return { unlocked: newlyUnlocked };
  }

  _checkCondition(achievement, stats) {
    const { name, xpReward } = achievement;
    if (name === "First Blood" && stats.questsCompleted < 1) return false;
    if (name === "Speed Demon" && stats.questsCompleted < 1) return false;
    if (name === "Battle Novice" && stats.battlesPlayed < 1) return false;
    if (name === "Battle Master" && stats.battlesPlayed < 10) return false;
    if (name === "Code Warrior" && stats.questsCompleted < 50) return false;
    if (xpReward >= 1000 && stats.level < 10) return false;
    return true;
  }

  async getAchievements({ page, limit, category }) {
    const prisma = getPrisma();
    const where = {};
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      prisma.achievement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.achievement.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getUserAchievements(profileId) {
    const prisma = getPrisma();
    return prisma.userAchievement.findMany({
      where: { profileId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    });
  }

  async getTitles() {
    const prisma = getPrisma();
    return prisma.title.findMany({ orderBy: { name: "asc" } });
  }

  async getUserTitles(profileId) {
    const prisma = getPrisma();
    return prisma.userTitle.findMany({
      where: { profileId },
      include: { title: true },
    });
  }

  async equipTitle(profileId, titleId) {
    const prisma = getPrisma();

    const owned = await prisma.userTitle.findUnique({
      where: { profileId_titleId: { profileId, titleId } },
    });
    if (!owned) throw Errors.NotFound("Title not unlocked");

    await prisma.$transaction([
      prisma.userTitle.updateMany({
        where: { profileId, equipped: true },
        data: { equipped: false },
      }),
      prisma.userTitle.update({
        where: { profileId_titleId: { profileId, titleId } },
        data: { equipped: true },
      }),
    ]);

    return { titleId, equipped: true };
  }

  async getStreaks(profileId) {
    const prisma = getPrisma();
    return prisma.streak.findMany({
      where: { profileId },
      orderBy: { type: "asc" },
    });
  }

  async updateStreak(profileId, type) {
    const prisma = getPrisma();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.streak.findUnique({
      where: { profileId_type: { profileId, type } },
    });

    if (!streak) {
      return prisma.streak.create({
        data: {
          profileId,
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
      return prisma.streak.update({
        where: { profileId_type: { profileId, type } },
        data: {
          currentStreak: 1,
          lastActiveDate: today,
        },
      });
    }

    const newCurrent = streak.currentStreak + 1;
    const newLongest = Math.max(streak.longestStreak, newCurrent);

    return prisma.streak.update({
      where: { profileId_type: { profileId, type } },
      data: {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastActiveDate: today,
      },
    });
  }

  async addCoins(profileId, amount, reason, referenceType, referenceId) {
    const prisma = getPrisma();
    if (amount === 0) throw Errors.BadRequest("Amount cannot be zero");

    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw Errors.NotFound("Profile");

    const [transaction] = await prisma.$transaction([
      prisma.coinTransaction.create({
        data: {
          profileId,
          amount,
          balanceAfter: BigInt(0),
          reason,
          referenceType,
          referenceId,
        },
      }),
    ]);

    return { transaction };
  }

  async getCoinBalance(profileId) {
    const prisma = getPrisma();
    const lastTx = await prisma.coinTransaction.findFirst({
      where: { profileId },
      orderBy: { createdAt: "desc" },
      select: { balanceAfter: true },
    });
    return { coins: lastTx ? Number(lastTx.balanceAfter) : 0 };
  }

  async getCoinHistory(profileId, { page, limit }) {
    const prisma = getPrisma();
    const where = { profileId };

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
