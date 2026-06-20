import { MessagingService } from "../../modules/messaging/messaging.service.js";

const messagingService = new MessagingService();

export function handleChatEvents(io, socket) {
  socket.on("chat:join", ({ conversationId }) => {
    socket.join(`chat:${conversationId}`);
  });

  socket.on("chat:leave", ({ conversationId }) => {
    socket.leave(`chat:${conversationId}`);
  });

  socket.on("chat:send", async ({ conversationId, content }) => {
    try {
      const message = await messagingService.sendMessage(conversationId, socket.userId, content);
      io.to(`chat:${conversationId}`).emit("chat:message", { conversationId, message });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("chat:typing", ({ conversationId }) => {
    socket.to(`chat:${conversationId}`).emit("chat:typing", {
      conversationId,
      userId: socket.userId,
      username: socket.username,
    });
  });

  socket.on("chat:read", async ({ conversationId, messageId }) => {
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
