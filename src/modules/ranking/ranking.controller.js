import { RankingService } from "./ranking.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";
import { parsePagination } from "../../shared/utils/pagination.js";

const rankingService = new RankingService();

export class RankingController {
  async getLeaderboard(req, res, next) {
    try {
      const pagination = parsePagination(req.query);
      const result = await rankingService.getLeaderboard(pagination);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getAllRanks(req, res, next) {
    try {
      const ranks = await rankingService.getAllRanks();
      return sendSuccess(res, ranks);
    } catch (error) {
      next(error);
    }
  }

  async getRankHistory(req, res, next) {
    try {
      const history = await rankingService.getRankHistory(req.params.userId);
      return sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }

  async getUserRank(req, res, next) {
    try {
      const rank = await rankingService.getUserRank(req.params.userId);
      return sendSuccess(res, rank);
    } catch (error) {
      next(error);
    }
  }
}
