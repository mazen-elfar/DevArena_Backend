import { NotificationsService } from "./notifications.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";
import { parsePagination } from "../../shared/utils/pagination.js";

const notificationsService = new NotificationsService();

export class NotificationsController {
  async list(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const unreadOnly = req.query.unreadOnly === "true";
      const result = await notificationsService.list(req.user.id, { page, limit, unreadOnly });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationsService.getUnreadCount(req.user.id);
      return sendSuccess(res, { count });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req, res, next) {
    try {
      const result = await notificationsService.markRead(req.params.id, req.user.id);
      return sendSuccess(res, result, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await notificationsService.markAllRead(req.user.id);
      return sendSuccess(res, null, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await notificationsService.delete(req.params.id, req.user.id);
      return sendSuccess(res, null, "Notification deleted");
    } catch (error) {
      next(error);
    }
  }
}
