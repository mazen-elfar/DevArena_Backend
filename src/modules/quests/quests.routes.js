import { Router } from "express";
import { z } from "zod";
import { QuestsController } from "./quests.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { codeExecutionLimiter } from "../../shared/middleware/rate-limit.middleware.js";

const router = Router();
const controller = new QuestsController();

const submitSchema = z.object({
  language: z.enum(["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "JAVA", "CPP", "CSHARP", "GO"]),
  sourceCode: z.string().max(50000),
});

// Public routes
router.get("/categories", (req, res, next) => controller.listCategories(req, res, next));
router.get("/categories/:slug", (req, res, next) => controller.getCategoryBySlug(req, res, next));
router.get("/daily", (req, res, next) => controller.getDailyQuest(req, res, next));
router.get("/", (req, res, next) => controller.listQuests(req, res, next));
router.get("/:id", (req, res, next) => controller.getQuest(req, res, next));
router.get("/:id/leaderboard", (req, res, next) => controller.getQuestLeaderboard(req, res, next));

// Protected routes
router.post(
  "/:id/submit",
  authenticate,
  codeExecutionLimiter,
  validate(submitSchema),
  (req, res, next) => controller.submitSolution(req, res, next),
);
router.get("/submissions/my", authenticate, (req, res, next) => controller.getMySubmissions(req, res, next));

export default router;
