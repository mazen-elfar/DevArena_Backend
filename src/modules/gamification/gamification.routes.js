import { Router } from "express";
import { z } from "zod";
import { GamificationController } from "./gamification.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";

const router = Router();
const controller = new GamificationController();

const addXpSchema = z.object({
  amount: z.number().int().positive(),
  source: z.enum(["QUEST", "BATTLE", "TOURNAMENT", "DAILY", "ACHIEVEMENT"]),
  description: z.string().max(255).optional(),
  referenceId: z.string().uuid().optional(),
});

const equipTitleSchema = z.object({
  titleId: z.number().int().positive(),
});

const updateStreakSchema = z.object({
  type: z.enum(["DAILY_LOGIN", "DAILY_QUEST", "DAILY_BATTLE"]),
});

// Public routes
router.get("/achievements", (req, res, next) => controller.getAchievements(req, res, next));
router.get("/titles", (req, res, next) => controller.getTitles(req, res, next));

// Protected routes
router.post("/xp", authenticate, validate(addXpSchema), (req, res, next) => controller.addXp(req, res, next));
router.get("/achievements/me", authenticate, (req, res, next) => controller.getUserAchievements(req, res, next));
router.post("/achievements/check", authenticate, (req, res, next) => controller.checkAchievements(req, res, next));
router.get("/titles/me", authenticate, (req, res, next) => controller.getUserTitles(req, res, next));
router.put("/titles/equip", authenticate, validate(equipTitleSchema), (req, res, next) => controller.equipTitle(req, res, next));
router.get("/streaks", authenticate, (req, res, next) => controller.getStreaks(req, res, next));
router.post("/streaks", authenticate, validate(updateStreakSchema), (req, res, next) => controller.updateStreak(req, res, next));
router.get("/coins", authenticate, (req, res, next) => controller.getCoinBalance(req, res, next));
router.get("/coins/history", authenticate, (req, res, next) => controller.getCoinHistory(req, res, next));

export default router;
