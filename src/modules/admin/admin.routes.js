import { Router } from "express";
import { AdminController } from "./admin.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { requireMinRole } from "../../shared/middleware/rbac.middleware.js";

const router = Router();
const controller = new AdminController();

const adminOnly = [authenticate, requireMinRole("admin")];

router.get("/reports", ...adminOnly, (req, res, next) => controller.getReports(req, res, next));
router.put("/reports/:id", ...adminOnly, (req, res, next) => controller.resolveReport(req, res, next));

router.post("/users/:id/ban", ...adminOnly, (req, res, next) => controller.banUser(req, res, next));
router.post("/users/:id/suspend", ...adminOnly, (req, res, next) => controller.suspendUser(req, res, next));
router.post("/users/:id/mute", ...adminOnly, (req, res, next) => controller.muteUser(req, res, next));
router.post("/users/:id/warn", ...adminOnly, (req, res, next) => controller.warnUser(req, res, next));

router.get("/audit-logs", ...adminOnly, (req, res, next) => controller.getAuditLogs(req, res, next));
router.get("/actions", ...adminOnly, (req, res, next) => controller.getAdminActions(req, res, next));
router.get("/dashboard", ...adminOnly, (req, res, next) => controller.getDashboardStats(req, res, next));

export default router;
