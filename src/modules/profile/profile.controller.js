/**
 * modules/profile/profile.controller.js
 * Handles all profile-related HTTP requests.
 */

import { ProfileService } from "./profile.service.js";
import { sendSuccess, sendPaginated } from "../../shared/utils/api-response.js";

const profileService = new ProfileService();

export class ProfileController {
  // ── Public ───────────────────────────────────────────────

  async getProfileByUsername(req, res, next) {
    try {
      const data = await profileService.getProfileByUsername(req.params.username, req.user?.profile?.id);
      return sendSuccess(res, data, "Profile retrieved");
    } catch (err) {
      next(err);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const data = await profileService.getStatistics(req.params.username);
      return sendSuccess(res, data, "Statistics retrieved");
    } catch (err) {
      next(err);
    }
  }

  async getAchievements(req, res, next) {
    try {
      const data = await profileService.getAchievements(req.params.username);
      return sendSuccess(res, data, "Achievements retrieved");
    } catch (err) {
      next(err);
    }
  }

  async getActivity(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const data = await profileService.getActivity(req.params.username, { page, limit });
      return sendPaginated(res, data);
    } catch (err) {
      next(err);
    }
  }

  async getFollowers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const data = await profileService.getFollowers(req.params.username, { page, limit });
      return sendPaginated(res, data);
    } catch (err) {
      next(err);
    }
  }

  async getFollowing(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const data = await profileService.getFollowing(req.params.username, { page, limit });
      return sendPaginated(res, data);
    } catch (err) {
      next(err);
    }
  }

  // ── Protected ────────────────────────────────────────────

  async getMe(req, res, next) {
    try {
      const data = await profileService.getMe(req.user.id);
      return sendSuccess(res, data, "Profile retrieved");
    } catch (err) {
      next(err);
    }
  }

  async completeOnboarding(req, res, next) {
    try {
      const data = await profileService.completeOnboarding(req.user.id, req.body);
      return sendSuccess(res, data, "Profile updated");
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const data = await profileService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, data, "Profile updated");
    } catch (err) {
      next(err);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const data = await profileService.uploadAvatar(req.user.id, req.file);
      return sendSuccess(res, data, "Avatar uploaded");
    } catch (err) {
      next(err);
    }
  }

  async uploadBanner(req, res, next) {
    try {
      const data = await profileService.uploadBanner(req.user.id, req.file);
      return sendSuccess(res, data, "Banner uploaded");
    } catch (err) {
      next(err);
    }
  }

  async followUser(req, res, next) {
    try {
      const data = await profileService.followUser(req.user.profile.id, req.params.userId);
      return sendSuccess(res, data, "User followed");
    } catch (err) {
      next(err);
    }
  }

  async unfollowUser(req, res, next) {
    try {
      await profileService.unfollowUser(req.user.profile.id, req.params.userId);
      return sendSuccess(res, null, "User unfollowed");
    } catch (err) {
      next(err);
    }
  }
}
