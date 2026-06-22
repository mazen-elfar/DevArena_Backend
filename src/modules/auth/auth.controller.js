import { AuthService } from "./auth.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";
import { exchangeGoogleCode, exchangeGitHubCode } from "./oauth.strategy.js";
import { env } from "../../config/env.js";

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
      // Accept refreshToken from body (SPA-friendly; no cookie-parser required)
      const token = req.body?.refreshToken;
      const result = await authService.refresh(token);
      return sendSuccess(res, result, "Token refreshed");
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // Accept refreshToken from body OR cookie
      const token = req.body?.refreshToken || req.cookies?.refreshToken;
      await authService.logout(req.user.id, token);
      return sendSuccess(res, null, "Logged out");
    } catch (error) {
      next(error);
    }
  }

  async me(req, res) {
    return sendSuccess(res, req.user, "Current user");
  }

  // ─── Social Auth ──────────────────────────────────────────────────────────

  /**
   * GET /auth/callback/:provider
   * Receives the authorization code from the OAuth provider,
   * fetches the profile, finds/creates the user, then redirects
   * the frontend with a short-lived temp code.
   */
  async oauthCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, error } = req.query;
      const clientUrl = env.CLIENT_URL ?? "http://localhost:5173";

      if (error || !code) {
        return res.redirect(`${clientUrl}/auth?error=oauth_denied`);
      }

      // Exchange code → profile
      let profile;
      if (provider === "google") {
        profile = await exchangeGoogleCode(code);
      } else if (provider === "github") {
        profile = await exchangeGitHubCode(code);
      } else {
        return res.redirect(`${clientUrl}/auth?error=unknown_provider`);
      }

      // Find or create user
      const { user } = await authService.findOrCreateSocialUser({
        provider: provider.toUpperCase(),
        ...profile,
      });

      // Issue temp code and redirect back to the frontend callback handler.
      // The frontend SocialCallback component will exchange this for real tokens.
      const tempCode = await authService.issueTempCode(user.id);
      return res.redirect(`${clientUrl}/auth/callback?code=${tempCode}`);
    } catch (err) {
      console.error(`✗ OAuth Callback Error [${req.params.provider}]:`, err.message);
      const clientUrl = env.CLIENT_URL ?? "http://localhost:5173";
      
      // Detailed error for developers, generic for users
      const errorCode = err.code === "INTERNAL_ERROR" ? "setup_error" : "auth_failed";
      return res.redirect(`${clientUrl}/auth?error=${errorCode}`);
    }
  }

  /**
   * POST /auth/exchange
   * { code: string } → { accessToken, refreshToken, user }
   */
  async exchangeCode(req, res, next) {
    try {
      const { code } = req.body ?? {};
      const result = await authService.exchangeSocialCode(code);
      return sendSuccess(res, result, "Authenticated");
    } catch (err) {
      console.error("✗ Social Code Exchange Error:", err.message);
      next(err);
    }
  }

}
