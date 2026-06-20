import { TournamentsService } from "./tournaments.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";

const tournamentsService = new TournamentsService();

export class TournamentsController {
  async createTournament(req, res, next) {
    try {
      const tournament = await tournamentsService.createTournament(req.user.id, req.body);
      return sendSuccess(res, tournament, "Tournament created", 201);
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const registration = await tournamentsService.register(req.user.id, req.params.id);
      return sendSuccess(res, registration, "Registered successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async listTournaments(req, res, next) {
    try {
      const { page, limit, status, type } = req.query;
      const result = await tournamentsService.listTournaments({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        type,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getTournament(req, res, next) {
    try {
      const tournament = await tournamentsService.getTournament(req.params.id);
      return sendSuccess(res, tournament);
    } catch (error) {
      next(error);
    }
  }

  async getBrackets(req, res, next) {
    try {
      const brackets = await tournamentsService.getBrackets(req.params.id);
      return sendSuccess(res, brackets);
    } catch (error) {
      next(error);
    }
  }

  async updateBracket(req, res, next) {
    try {
      const { winnerId, battleId } = req.body;
      const bracket = await tournamentsService.updateBracket(req.params.bracketId, winnerId, battleId);
      return sendSuccess(res, bracket, "Bracket updated");
    } catch (error) {
      next(error);
    }
  }

  async getResults(req, res, next) {
    try {
      const results = await tournamentsService.getResults(req.params.id);
      return sendSuccess(res, results);
    } catch (error) {
      next(error);
    }
  }
}
