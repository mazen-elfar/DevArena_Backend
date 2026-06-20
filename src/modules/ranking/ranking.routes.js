import { Router } from "express";
import { RankingController } from "./ranking.controller.js";

const router = Router();
const controller = new RankingController();

router.get("/leaderboard", (req, res, next) => controller.getLeaderboard(req, res, next));
router.get("/ranks", (req, res, next) => controller.getAllRanks(req, res, next));
router.get("/history/:userId", (req, res, next) => controller.getRankHistory(req, res, next));
router.get("/user/:userId", (req, res, next) => controller.getUserRank(req, res, next));

export default router;
