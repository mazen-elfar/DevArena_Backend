import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class AdminService {
  async getReports({ page, limit, status }) {
    const prisma = getPrisma();
    const where = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, username: true, avatarUrl: true } },
          reviewer: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async resolveReport(reportId, adminId, { status, reason }) {
    const prisma = getPrisma();

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw Errors.NotFound("Report");
    if (report.status !== "OPEN") throw Errors.BadRequest("Report already reviewed");

    const [updated] = await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: {
          status,
          reviewedBy: adminId,
          resolvedAt: new Date(),
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: "REPORT_RESOLVED",
          entityType: "REPORT",
          entityId: reportId,
          oldValues: { status: report.status },
          newValues: { status, reason },
        },
      }),
    ]);

    return updated;
  }

  async banUser(adminId, targetUserId, { reason, durationHrs }) {
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw Errors.NotFound("User");

    const expiresAt = durationHrs
      ? new Date(Date.now() + durationHrs * 60 * 60 * 1000)
      : null;

    const [action] = await prisma.$transaction([
      prisma.adminAction.create({
        data: {
          adminId,
          targetUserId,
          action: "BAN",
          reason,
          durationHrs,
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: targetUserId },
        data: { isBanned: true },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: "USER_BANNED",
          entityType: "USER",
          entityId: targetUserId,
          oldValues: { isBanned: user.isBanned },
          newValues: { isBanned: true, reason, durationHrs },
        },
      }),
    ]);

    return action;
  }

  async suspendUser(adminId, targetUserId, { reason, durationHrs }) {
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw Errors.NotFound("User");

    if (!durationHrs) throw Errors.BadRequest("Duration required for suspension");

    const expiresAt = new Date(Date.now() + durationHrs * 60 * 60 * 1000);

    const [action] = await prisma.$transaction([
      prisma.adminAction.create({
        data: {
          adminId,
          targetUserId,
          action: "SUSPEND",
          reason,
          durationHrs,
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: targetUserId },
        data: { isBanned: true },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: "USER_SUSPENDED",
          entityType: "USER",
          entityId: targetUserId,
          oldValues: { isBanned: user.isBanned },
          newValues: { isBanned: true, reason, durationHrs, expiresAt },
        },
      }),
    ]);

    return action;
  }

  async muteUser(adminId, targetUserId, { reason }) {
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw Errors.NotFound("User");

    const [action] = await prisma.$transaction([
      prisma.adminAction.create({
        data: {
          adminId,
          targetUserId,
          action: "MUTE",
          reason,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: "USER_MUTED",
          entityType: "USER",
          entityId: targetUserId,
          newValues: { reason },
        },
      }),
    ]);

    return action;
  }

  async warnUser(adminId, targetUserId, { reason }) {
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw Errors.NotFound("User");

    const [action] = await prisma.$transaction([
      prisma.adminAction.create({
        data: {
          adminId,
          targetUserId,
          action: "WARN",
          reason,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: "USER_WARNED",
          entityType: "USER",
          entityId: targetUserId,
          newValues: { reason },
        },
      }),
    ]);

    return action;
  }

  async getAuditLogs({ page, limit, adminId, entityType }) {
    const prisma = getPrisma();
    const where = {};
    if (adminId) where.adminId = adminId;
    if (entityType) where.entityType = entityType;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          admin: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getAdminActions({ page, limit, targetUserId }) {
    const prisma = getPrisma();
    const where = {};
    if (targetUserId) where.targetUserId = targetUserId;

    const [items, total] = await Promise.all([
      prisma.adminAction.findMany({
        where,
        include: {
          admin: { select: { id: true, username: true } },
          target: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.adminAction.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getDashboardStats() {
    const prisma = getPrisma();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, activeToday, pendingReports, totalReports, recentActions] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { isOnline: true } }),
        prisma.report.count({ where: { status: "OPEN" } }),
        prisma.report.count(),
        prisma.adminAction.count({
          where: { createdAt: { gte: today } },
        }),
      ]);

    return {
      totalUsers,
      activeToday,
      pendingReports,
      totalReports,
      recentActions,
    };
  }
}
