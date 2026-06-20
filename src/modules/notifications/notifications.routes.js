import { Router } from "express";
import { NotificationsController } from "./notifications.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";

const router = Router();
const controller = new NotificationsController();

router.get("/", authenticate, (req, res, next) => controller.list(req, res, next));
router.get("/unread-count", authenticate, (req, res, next) => controller.getUnreadCount(req, res, next));
router.put("/read-all", authenticate, (req, res, next) => controller.markAllRead(req, res, next));
router.put("/:id/read", authenticate, (req, res, next) => controller.markRead(req, res, next));
router.delete("/:id", authenticate, (req, res, next) => controller.delete(req, res, next));

export default router;
