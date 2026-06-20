import { getPrisma } from '../../config/database.js';

export class AnalyticsService {
  async logActivity(userId, { action, entityType, entityId, metadata, ipAddress, userAgent }) {
    const prisma = getPrisma();
    return prisma.activityLog.create({
      data: {
        userId: userId || null,
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        metadata: metadata || undefined,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  }

  async getUserActivity(userId, { page, limit }) {
    const prisma = getPrisma();
    const where = { userId };

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getDashboardStats() {
    const prisma = getPrisma();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalUsers, newToday, activeToday, totalPosts, totalBattles, totalQuests] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.user.count({ where: { isOnline: true } }),
        prisma.post.count({ where: { deletedAt: null } }),
        prisma.battle.count(),
        prisma.quest.count(),
      ]);

    return {
      totalUsers,
      newToday,
      activeToday,
      totalPosts,
      totalBattles,
      totalQuests,
    };
  }

  async getSystemStats() {
    const prisma = getPrisma();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [usersOnline, battlesActive, questsSolvedToday] = await Promise.all([
      prisma.user.count({ where: { isOnline: true } }),
      prisma.battle.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.activityLog.count({
        where: {
          action: 'QUEST_COMPLETED',
          createdAt: { gte: startOfToday },
        },
      }),
    ]);

    return {
      usersOnline,
      battlesActive,
      questsSolvedToday,
    };
  }
}
