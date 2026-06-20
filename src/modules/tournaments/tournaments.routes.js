import { Router } from "express";
import { z } from "zod";
import { TournamentsController } from "./tournaments.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { requireMinRole } from "../../shared/middleware/rbac.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";

const router = Router();
const controller = new TournamentsController();

const createTournamentSchema = z.object({
  name: z.string().max(255),
  type: z.enum(["WEEKLY", "SEASONAL"]),
  maxParticipants: z.number().int().positive().optional(),
  entryFee: z.number().positive().optional(),
  prizePool: z.number().positive().optional(),
  description: z.string().optional(),
  rules: z.string().optional(),
  startsAt: z.string().datetime(),
});

const updateBracketSchema = z.object({
  winnerId: z.string().uuid(),
  battleId: z.string().uuid(),
});

// Public routes
router.get("/", (req, res, next) => controller.listTournaments(req, res, next));
router.get("/:id", (req, res, next) => controller.getTournament(req, res, next));
router.get("/:id/brackets", (req, res, next) => controller.getBrackets(req, res, next));
router.get("/:id/results", (req, res, next) => controller.getResults(req, res, next));

// Protected routes
router.post(
  "/",
  authenticate,
  requireMinRole("admin"),
  validate(createTournamentSchema),
  (req, res, next) => controller.createTournament(req, res, next),
);
router.post("/:id/register", authenticate, (req, res, next) => controller.register(req, res, next));
router.put(
  "/brackets/:bracketId",
  authenticate,
  requireMinRole("admin"),
  validate(updateBracketSchema),
  (req, res, next) => controller.updateBracket(req, res, next),
);

export default router;
