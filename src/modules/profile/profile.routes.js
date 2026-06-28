/**
 * modules/profile/profile.routes.js
 * Full profile API: public profiles, updates, stats, achievements, activity, follow/unfollow.
 *
 * IMPORTANT: Fixed routes (/me, /onboarding, /avatar, /banner) MUST come before
 * parameterized routes (/:username, /userId) to prevent Express from matching
 * "me" as a username param.
 */

import { Router } from "express";
import { z } from "zod";
import { ProfileController } from "./profile.controller.js";
import { authenticate, optionalAuth } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { uploadAvatar, uploadBanner, handleUploadError } from "../../shared/middleware/upload.middleware.js";

const router = Router();
const controller = new ProfileController();

// ── Zod schemas ──────────────────────────────────────────────

const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  university: z.string().max(200).optional(),
  major: z.string().max(100).optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional(),
  country: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  githubUsername: z.string().max(50).optional(),
  githubUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
});

// ── Fixed protected routes (before /:username) ───────────────

// GET /api/profile/me
router.get("/me", authenticate, (req, res, next) => controller.getMe(req, res, next));

// PATCH /api/profile/onboarding
router.patch("/onboarding", authenticate, (req, res, next) => controller.completeOnboarding(req, res, next));

// PATCH /api/profile
router.patch("/", authenticate, validate(updateProfileSchema), (req, res, next) => controller.updateProfile(req, res, next));

// POST /api/profile/avatar
router.post("/avatar", authenticate, (req, res, next) => {
  uploadAvatar.single("avatar")(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    controller.uploadAvatar(req, res, next);
  });
});

// POST /api/profile/banner
router.post("/banner", authenticate, (req, res, next) => {
  uploadBanner.single("banner")(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    controller.uploadBanner(req, res, next);
  });
});

// ── Parameterized routes ─────────────────────────────────────

// GET /api/profile/:username — public profile view
router.get("/:username", optionalAuth, (req, res, next) => controller.getProfileByUsername(req, res, next));

// GET /api/profile/:username/statistics
router.get("/:username/statistics", (req, res, next) => controller.getStatistics(req, res, next));

// GET /api/profile/:username/achievements
router.get("/:username/achievements", (req, res, next) => controller.getAchievements(req, res, next));

// GET /api/profile/:username/activity
router.get("/:username/activity", (req, res, next) => controller.getActivity(req, res, next));

// GET /api/profile/:username/followers
router.get("/:username/followers", (req, res, next) => controller.getFollowers(req, res, next));

// GET /api/profile/:username/following
router.get("/:username/following", (req, res, next) => controller.getFollowing(req, res, next));

// POST /api/profile/:userId/follow
router.post("/:userId/follow", authenticate, (req, res, next) => controller.followUser(req, res, next));

// DELETE /api/profile/:userId/unfollow
router.delete("/:userId/unfollow", authenticate, (req, res, next) => controller.unfollowUser(req, res, next));

export default router;
