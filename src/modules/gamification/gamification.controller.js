import { GamificationService } from "./gamification.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";

const gamificationService = new GamificationService();

export class GamificationController {
  async addXp(req, res, next) {
    try {
      const { userId, amount, source, description, referenceId } = req.body;
      const result = await gamificationService.addXp(userId, amount, source, description, referenceId);
      return sendSuccess(res, result, "XP added");
    } catch (error) {
      next(error);
    }
  }

  async getAchievements(req, res, next) {
    try {
      const { page, limit, category } = req.query;
      const result = await gamificationService.getAchievements({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        category,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUserAchievements(req, res, next) {
    try {
      const result = await gamificationService.getUserAchievements(req.user.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async checkAchievements(req, res, next) {
    try {
      const result = await gamificationService.checkAchievements(req.user.id);
      return sendSuccess(res, result, "Achievements checked");
    } catch (error) {
      next(error);
    }
  }

  async getTitles(req, res, next) {
    try {
      const result = await gamificationService.getTitles();
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUserTitles(req, res, next) {
    try {
      const result = await gamificationService.getUserTitles(req.user.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async equipTitle(req, res, next) {
    try {
      const { titleId } = req.body;
      const result = await gamificationService.equipTitle(req.user.id, titleId);
      return sendSuccess(res, result, "Title equipped");
    } catch (error) {
      next(error);
    }
  }

  async getStreaks(req, res, next) {
    try {
      const result = await gamificationService.getStreaks(req.user.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateStreak(req, res, next) {
    try {
      const { type } = req.body;
      const result = await gamificationService.updateStreak(req.user.id, type);
      return sendSuccess(res, result, "Streak updated");
    } catch (error) {
      next(error);
    }
  }

  async getCoinBalance(req, res, next) {
    try {
      const result = await gamificationService.getCoinBalance(req.user.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCoinHistory(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await gamificationService.getCoinHistory(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
