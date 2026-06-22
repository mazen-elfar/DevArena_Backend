/**
 * modules/profile/profile.routes.js
 */

import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";

const router = Router();
const controller = new ProfileController();

// GET /api/profile/me — full profile state
router.get("/me", authenticate, (req, res, next) => controller.getMe(req, res, next));

// PATCH /api/profile/onboarding — complete social-auth onboarding
router.patch("/onboarding", authenticate, (req, res, next) =>
  controller.completeOnboarding(req, res, next),
);

export default router;
