import { MessagingService } from "./messaging.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";

const messagingService = new MessagingService();

export class MessagingController {
  async listConversations(req, res, next) {
    try {
      const result = await messagingService.listConversations(req.user.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createOrGetConversation(req, res, next) {
    try {
      const result = await messagingService.createOrGetConversation(req.user.id, req.body.userId);
      return sendSuccess(res, result, "Conversation retrieved", 201);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await messagingService.getUnreadCount(req.user.id);
      return sendSuccess(res, { count });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const cursor = req.query.cursor || null;
      const result = await messagingService.getMessages(req.params.id, req.user.id, { cursor, limit });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const result = await messagingService.sendMessage(req.params.id, req.user.id, req.body.content);
      return sendSuccess(res, result, "Message sent", 201);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      await messagingService.markAsRead(req.params.id, req.user.id, req.params.messageId);
      return sendSuccess(res, null, "Messages marked as read");
    } catch (error) {
      next(error);
    }
  }
}
