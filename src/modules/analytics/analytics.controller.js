import { AnalyticsService } from './analytics.service.js';
import { sendSuccess } from '../../shared/utils/api-response.js';
import { parsePagination } from '../../shared/utils/pagination.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async logActivity(req, res, next) {
    try {
      const { action, entityType, entityId, metadata } = req.body;
      const ipAddress = req.ip || req.connection?.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const log = await analyticsService.logActivity(req.user.id, {
        action,
        entityType,
        entityId,
        metadata,
        ipAddress,
        userAgent,
      });
      return sendSuccess(res, log, 'Activity logged', 201);
    } catch (error) {
      next(error);
    }
  }

  async getUserActivity(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const result = await analyticsService.getUserActivity(req.params.userId, { page, limit });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const stats = await analyticsService.getDashboardStats();
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getSystemStats(req, res, next) {
    try {
      const stats = await analyticsService.getSystemStats();
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
