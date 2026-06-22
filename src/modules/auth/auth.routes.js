import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authLimiter } from "../../shared/middleware/rate-limit.middleware.js";
import { registerSchema, loginSchema } from "./auth.validator.js";
import { env } from "../../config/env.js";

const router = Router();
const controller = new AuthController();

// ─── Local Auth ────────────────────────────────────────────────────────────
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  (req, res, next) => controller.register(req, res, next),
);
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  (req, res, next) => controller.login(req, res, next),
);
router.post("/refresh", (req, res, next) => controller.refresh(req, res, next));
router.post("/logout", authenticate, (req, res, next) => controller.logout(req, res, next));
router.get("/me", authenticate, (req, res) => controller.me(req, res));

// ─── Social Auth ──────────────────────────────────────────────────────────
// Initiate OAuth flow — redirect user to provider
router.get("/google", (_req, res) => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: env.GOOGLE_CALLBACK_URL ?? "",
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/github", (_req, res) => {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID ?? "",
    redirect_uri: env.GITHUB_CALLBACK_URL ?? "",
    scope: "read:user user:email",
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// Receive authorization code from provider
router.get("/callback/:provider", authLimiter, (req, res, next) =>
  controller.oauthCallback(req, res, next),
);

// Frontend exchanges the temp code for real JWT tokens
router.post("/exchange", authLimiter, (req, res, next) =>
  controller.exchangeCode(req, res, next),
);

export default router;
