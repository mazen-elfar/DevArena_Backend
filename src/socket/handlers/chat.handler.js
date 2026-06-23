import { MessagingService } from "../../modules/messaging/messaging.service.js";
import { getPrisma } from "../../config/database.js";

const messagingService = new MessagingService();

async function isParticipant(conversationId, userId) {
  const prisma = getPrisma();
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
  });
  return !!participant;
}

export function handleChatEvents(io, socket) {
  socket.on("chat:join", async ({ conversationId }) => {
    if (!conversationId) return socket.emit("error", { message: "conversationId required" });

    const authorized = await isParticipant(conversationId, socket.userId);
    if (!authorized) return socket.emit("error", { message: "Not a participant of this conversation" });

    socket.join(`chat:${conversationId}`);
  });

  socket.on("chat:leave", ({ conversationId }) => {
    if (!conversationId) return;
    socket.leave(`chat:${conversationId}`);
  });

  socket.on("chat:send", async ({ conversationId, content }) => {
    if (!conversationId || !content) {
      return socket.emit("error", { message: "conversationId and content required" });
    }

    const authorized = await isParticipant(conversationId, socket.userId);
    if (!authorized) return socket.emit("error", { message: "Not a participant of this conversation" });

    try {
      const message = await messagingService.sendMessage(conversationId, socket.userId, content);
      io.to(`chat:${conversationId}`).emit("chat:message", { conversationId, message });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("chat:typing", ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(`chat:${conversationId}`).emit("chat:typing", {
      conversationId,
      userId: socket.userId,
      username: socket.username,
    });
  });

  socket.on("chat:read", async ({ conversationId, messageId }) => {
    if (!conversationId || !messageId) return;

    const authorized = await isParticipant(conversationId, socket.userId);
    if (!authorized) return socket.emit("error", { message: "Not a participant of this conversation" });

    try {
      await messagingService.markAsRead(conversationId, socket.userId, messageId);
      io.to(`chat:${conversationId}`).emit("chat:read", {
        conversationId,
        userId: socket.userId,
        messageId,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
}
