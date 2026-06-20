import { QuestsService } from "./quests.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";

const questsService = new QuestsService();

export class QuestsController {
  async listCategories(req, res, next) {
    try {
      const categories = await questsService.listCategories();
      return sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req, res, next) {
    try {
      const category = await questsService.getCategoryBySlug(req.params.slug);
      return sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  async listQuests(req, res, next) {
    try {
      const { page, limit, categoryId, difficulty } = req.query;
      const result = await questsService.listQuests({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        categoryId,
        difficulty,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getQuest(req, res, next) {
    try {
      const quest = await questsService.getQuest(req.params.id);
      return sendSuccess(res, quest);
    } catch (error) {
      next(error);
    }
  }

  async getDailyQuest(req, res, next) {
    try {
      const quest = await questsService.getDailyQuest();
      return sendSuccess(res, quest);
    } catch (error) {
      next(error);
    }
  }

  async submitSolution(req, res, next) {
    try {
      const submission = await questsService.submitSolution(
        req.user.id,
        req.params.id,
        req.body,
      );
      return sendSuccess(res, submission, "Solution submitted", 201);
    } catch (error) {
      next(error);
    }
  }

  async getMySubmissions(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await questsService.getMySubmissions(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getQuestLeaderboard(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await questsService.getQuestLeaderboard(req.params.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
