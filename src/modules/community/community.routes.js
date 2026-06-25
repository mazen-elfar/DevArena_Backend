import { Router } from "express";
import { z } from "zod";
import { CommunityController } from "./community.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";

const router = Router();
const controller = new CommunityController();

const createPostSchema = z.object({
  type: z.enum(["TEXT", "ACHIEVEMENT", "BATTLE_RESULT", "QUEST_COMPLETION", "TOURNAMENT_RESULT", "PROJECT_SHOWCASE", "DISCUSSION"]).nullish().default("TEXT"),
  title: z.string().max(255).nullish(),
  content: z.string().min(1),
});

const reactionSchema = z.object({
  type: z.enum(["LIKE", "LOVE", "FIRE", "MIND_BLOWN", "ROCKET"]),
});

const commentSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().uuid().nullish(),
});

// Public routes
router.get("/trending", (req, res, next) => controller.getTrending(req, res, next));
router.get("/", (req, res, next) => controller.listPosts(req, res, next));
router.get("/:id", (req, res, next) => controller.getPost(req, res, next));

// Protected routes
router.post("/", authenticate, validate(createPostSchema), (req, res, next) => controller.createPost(req, res, next));
router.put("/:id", authenticate, (req, res, next) => controller.updatePost(req, res, next));
router.delete("/:id", authenticate, (req, res, next) => controller.deletePost(req, res, next));
router.post("/:id/react", authenticate, validate(reactionSchema), (req, res, next) => controller.toggleReaction(req, res, next));
router.get("/:id/comments", (req, res, next) => controller.listComments(req, res, next));
router.post("/:id/comments", authenticate, validate(commentSchema), (req, res, next) => controller.createComment(req, res, next));
router.post("/:id/save", authenticate, (req, res, next) => controller.toggleSave(req, res, next));

export default router;
