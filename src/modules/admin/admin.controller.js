import { AdminService } from "./admin.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";
import { parsePagination } from "../../shared/utils/pagination.js";

const adminService = new AdminService();

export class AdminController {
  async getReports(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const { status } = req.query;
      const result = await adminService.getReports({ page, limit, status });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req, res, next) {
    try {
      const { status, reason } = req.body;
      const result = await adminService.resolveReport(req.params.id, req.user.id, {
        status,
        reason,
      });
      return sendSuccess(res, result, "Report resolved");
    } catch (error) {
      next(error);
    }
  }

  async banUser(req, res, next) {
    try {
      const { reason, durationHrs } = req.body;
      const result = await adminService.banUser(req.user.id, req.params.id, {
        reason,
        durationHrs,
      });
      return sendSuccess(res, result, "User banned");
    } catch (error) {
      next(error);
    }
  }

  async suspendUser(req, res, next) {
    try {
      const { reason, durationHrs } = req.body;
      const result = await adminService.suspendUser(req.user.id, req.params.id, {
        reason,
        durationHrs,
      });
      return sendSuccess(res, result, "User suspended");
    } catch (error) {
      next(error);
    }
  }

  async muteUser(req, res, next) {
    try {
      const { reason } = req.body;
      const result = await adminService.muteUser(req.user.id, req.params.id, { reason });
      return sendSuccess(res, result, "User muted");
    } catch (error) {
      next(error);
    }
  }

  async warnUser(req, res, next) {
    try {
      const { reason } = req.body;
      const result = await adminService.warnUser(req.user.id, req.params.id, { reason });
      return sendSuccess(res, result, "User warned");
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const { adminId, entityType } = req.query;
      const result = await adminService.getAuditLogs({ page, limit, adminId, entityType });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getAdminActions(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const { targetUserId } = req.query;
      const result = await adminService.getAdminActions({ page, limit, targetUserId });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const result = await adminService.getDashboardStats();
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
