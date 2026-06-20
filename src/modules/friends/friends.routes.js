import { Router } from "express";
import { FriendsController } from "./friends.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";

const router = Router();
const controller = new FriendsController();

// Friend routes
router.get("/", authenticate, (req, res, next) => controller.listFriends(req, res, next));
router.get("/requests", authenticate, (req, res, next) => controller.listPendingRequests(req, res, next));
router.post("/:userId/request", authenticate, (req, res, next) => controller.sendRequest(req, res, next));
router.put("/:userId/accept", authenticate, (req, res, next) => controller.acceptRequest(req, res, next));
router.put("/:userId/reject", authenticate, (req, res, next) => controller.rejectRequest(req, res, next));
router.delete("/:userId", authenticate, (req, res, next) => controller.removeFriend(req, res, next));

// Follow routes
router.post("/follow/:userId", authenticate, (req, res, next) => controller.followUser(req, res, next));
router.delete("/follow/:userId", authenticate, (req, res, next) => controller.unfollowUser(req, res, next));
router.get("/followers/:userId", (req, res, next) => controller.listFollowers(req, res, next));
router.get("/following/:userId", (req, res, next) => controller.listFollowing(req, res, next));

export default router;
