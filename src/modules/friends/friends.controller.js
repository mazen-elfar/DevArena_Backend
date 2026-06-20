import { FriendsService } from "./friends.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";
import { parsePagination } from "../../shared/utils/pagination.js";

const friendsService = new FriendsService();

export class FriendsController {
  async sendRequest(req, res, next) {
    try {
      const result = await friendsService.sendRequest(req.user.id, req.params.userId);
      return sendSuccess(res, result, "Friend request sent", 201);
    } catch (error) {
      next(error);
    }
  }

  async acceptRequest(req, res, next) {
    try {
      const result = await friendsService.acceptRequest(req.user.id, req.params.userId);
      return sendSuccess(res, result, "Friend request accepted");
    } catch (error) {
      next(error);
    }
  }

  async rejectRequest(req, res, next) {
    try {
      const result = await friendsService.rejectRequest(req.user.id, req.params.userId);
      return sendSuccess(res, result, "Friend request rejected");
    } catch (error) {
      next(error);
    }
  }

  async removeFriend(req, res, next) {
    try {
      await friendsService.removeFriend(req.user.id, req.params.userId);
      return sendSuccess(res, null, "Friend removed");
    } catch (error) {
      next(error);
    }
  }

  async listFriends(req, res, next) {
    try {
      const pagination = parsePagination(req.query);
      const result = await friendsService.listFriends(req.user.id, pagination);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async listPendingRequests(req, res, next) {
    try {
      const result = await friendsService.listPendingRequests(req.user.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async followUser(req, res, next) {
    try {
      const result = await friendsService.followUser(req.user.id, req.params.userId);
      return sendSuccess(res, result, "User followed", 201);
    } catch (error) {
      next(error);
    }
  }

  async unfollowUser(req, res, next) {
    try {
      await friendsService.unfollowUser(req.user.id, req.params.userId);
      return sendSuccess(res, null, "User unfollowed");
    } catch (error) {
      next(error);
    }
  }

  async listFollowers(req, res, next) {
    try {
      const pagination = parsePagination(req.query);
      const result = await friendsService.listFollowers(req.params.userId, pagination);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async listFollowing(req, res, next) {
    try {
      const pagination = parsePagination(req.query);
      const result = await friendsService.listFollowing(req.params.userId, pagination);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
