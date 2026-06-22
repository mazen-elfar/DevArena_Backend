/**
 * modules/profile/profile.controller.js
 */

import { ProfileService } from "./profile.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";

const profileService = new ProfileService();

export class ProfileController {
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
}
