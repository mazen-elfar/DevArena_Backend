import { AuthService } from "./auth.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";

const authService = new AuthService();

export class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, "Registration successful", 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      const result = await authService.refresh(token);
      return sendSuccess(res, result, "Token refreshed");
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.cookies?.refreshToken;
      await authService.logout(req.user.id, token);
      res.clearCookie("refreshToken");
      return sendSuccess(res, null, "Logged out");
    } catch (error) {
      next(error);
    }
  }

  async me(req, res) {
    return sendSuccess(res, req.user, "Current user");
  }
}
