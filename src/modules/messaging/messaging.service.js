import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

const participantSelect = {
  id: true,
  username: true,
  email: true,
  avatarUrl: true,
  bio: true,
  level: true,
  isOnline: true,
};

export class MessagingService {
  async createOrGetConversation(userId, otherUserId) {
    if (userId === otherUserId) {
      throw Errors.BadRequest("Cannot create conversation with yourself");
    }

    const prisma = getPrisma();

    const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
    if (!otherUser || otherUser.deletedAt) {
      throw Errors.NotFound("User");
    }

    const existing = await prisma.conversationParticipant.findFirst({
      where: {
        userId,
        conversation: {
          participants: { some: { userId: otherUserId } },
        },
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: participantSelect } },
            },
          },
        },
      },
    });

    if (existing) {
      return existing.conversation;
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: {
        participants: {
          include: { user: { select: participantSelect } },
        },
      },
    });

    return conversation;
  }

  async listConversations(userId) {
    const prisma = getPrisma();

    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: participantSelect } },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { sender: { select: participantSelect } },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
    });

    return participations.map((p) => {
      const conv = p.conversation;
      const otherParticipants = conv.participants
        .filter((part) => part.userId !== userId)
        .map((part) => part.user);
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        participants: otherParticipants,
        lastMessage,
        updatedAt: conv.updatedAt,
      };
    });
  }

  async getMessages(conversationId, userId, { cursor, limit }) {
    const prisma = getPrisma();

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });
    if (!participant) {
      throw Errors.NotFound("Conversation");
    }

    const where = { conversationId };
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const messages = await prisma.message.findMany({
      where,
      include: { sender: { select: participantSelect } },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

    return { items, nextCursor, hasMore };
  }

  async sendMessage(conversationId, senderId, content) {
    const prisma = getPrisma();

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: senderId },
      },
    });
    if (!participant) {
      throw Errors.NotFound("Conversation");
    }

    if (!content || !content.trim()) {
      throw Errors.BadRequest("Message content cannot be empty");
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId,
          content: content.trim(),
        },
        include: { sender: { select: participantSelect } },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return message;
  }

  async markAsRead(conversationId, userId, messageId) {
    const prisma = getPrisma();

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });
    if (!participant) {
      throw Errors.NotFound("Conversation");
    }

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message || message.conversationId !== conversationId) {
      throw Errors.NotFound("Message");
    }

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: { lastReadAt: message.createdAt },
    });

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        createdAt: { lte: message.createdAt },
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId) {
    const prisma = getPrisma();

    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: {
        conversationId: true,
        lastReadAt: true,
      },
    });

    let totalUnread = 0;

    for (const p of participations) {
      const where = {
        conversationId: p.conversationId,
        senderId: { not: userId },
        isRead: false,
      };

      if (p.lastReadAt) {
        where.createdAt = { gt: p.lastReadAt };
      }

      const count = await prisma.message.count({ where });
      totalUnread += count;
    }

    return totalUnread;
  }
}
