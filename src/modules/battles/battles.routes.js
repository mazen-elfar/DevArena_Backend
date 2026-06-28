import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { BattlesController } from "./battles.controller.js";

const router = Router();
const controller = new BattlesController();

const createBattleSchema = z.object({
  mode: z.enum(["RANKED", "CLASSIC", "FRIEND", "AI", "PRACTICE"]),
  questId: z.string().uuid(),
  opponentId: z.string().uuid().optional(),
  aiDifficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
});

const submitCodeSchema = z.object({
  sourceCode: z.string().max(50000),
  language: z.enum(["JAVASCRIPT", "TYPESCRIPT", "PYTHON", "JAVA", "CPP", "CSHARP", "GO"]),
});

router.get("/leaderboard", (req, res, next) => controller.getLeaderboard(req, res, next));
router.get("/", authenticate, (req, res, next) => controller.listBattles(req, res, next));
router.post("/", authenticate, validate(createBattleSchema), (req, res, next) => controller.createBattle(req, res, next));
router.get("/:id", (req, res, next) => controller.getBattle(req, res, next));
router.post("/:id/join", authenticate, (req, res, next) => controller.joinBattle(req, res, next));
router.post("/:id/leave", authenticate, (req, res, next) => controller.leaveBattle(req, res, next));
router.post("/:id/submit", authenticate, validate(submitCodeSchema), (req, res, next) => controller.submitCode(req, res, next));
router.post("/:id/complete", authenticate, (req, res, next) => controller.completeBattle(req, res, next));
router.post("/:id/cancel", authenticate, (req, res, next) => controller.cancelBattle(req, res, next));
router.get("/:id/results", (req, res, next) => controller.getBattleResults(req, res, next));

export default router;
