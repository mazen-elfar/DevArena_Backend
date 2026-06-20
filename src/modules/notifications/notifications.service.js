import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class NotificationsService {
  async create(userId, { type, title, message, link, metadata }) {
    const prisma = getPrisma();
    return prisma.notification.create({
      data: { userId, type, title, message, link, metadata },
    });
  }

  async list(userId, { page, limit, unreadOnly }) {
    const prisma = getPrisma();
    const skip = (page - 1) * limit;

    const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async markRead(notificationId, userId) {
    const prisma = getPrisma();

    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      throw Errors.NotFound("Notification");
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId) {
    const prisma = getPrisma();

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId) {
    const prisma = getPrisma();

    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return count;
  }

  async delete(notificationId, userId) {
    const prisma = getPrisma();

    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      throw Errors.NotFound("Notification");
    }

    await prisma.notification.delete({ where: { id: notificationId } });
  }
}
