import { BattlesService } from "./battles.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";
import { parsePagination } from "../../shared/utils/pagination.js";

const battlesService = new BattlesService();

export class BattlesController {
  async createBattle(req, res, next) {
    try {
      const battle = await battlesService.createBattle(req.user.id, req.body);
      return sendSuccess(res, battle, "Battle created", 201);
    } catch (error) {
      next(error);
    }
  }

  async joinBattle(req, res, next) {
    try {
      const battle = await battlesService.joinBattle(req.params.id, req.user.id);
      return sendSuccess(res, battle, "Joined battle");
    } catch (error) {
      next(error);
    }
  }

  async submitCode(req, res, next) {
    try {
      const submission = await battlesService.submitCode(
        req.params.id,
        req.user.id,
        req.body,
      );
      return sendSuccess(res, submission, "Code submitted", 201);
    } catch (error) {
      next(error);
    }
  }

  async getBattle(req, res, next) {
    try {
      const battle = await battlesService.getBattle(req.params.id);
      return sendSuccess(res, battle);
    } catch (error) {
      next(error);
    }
  }

  async listBattles(req, res, next) {
    try {
      const pagination = parsePagination(req.query);
      const result = await battlesService.listBattles(req.user.id, pagination);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req, res, next) {
    try {
      const pagination = parsePagination(req.query);
      const result = await battlesService.getLeaderboard(pagination);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
