import { Router } from "express";
import { MessagingController } from "./messaging.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";

const router = Router();
const controller = new MessagingController();

router.get("/", authenticate, (req, res, next) => controller.listConversations(req, res, next));
router.post("/", authenticate, (req, res, next) => controller.createOrGetConversation(req, res, next));
router.get("/unread", authenticate, (req, res, next) => controller.getUnreadCount(req, res, next));
router.get("/:id/messages", authenticate, (req, res, next) => controller.getMessages(req, res, next));
router.post("/:id/messages", authenticate, (req, res, next) => controller.sendMessage(req, res, next));
router.post("/:id/messages/:messageId/read", authenticate, (req, res, next) => controller.markAsRead(req, res, next));

export default router;
