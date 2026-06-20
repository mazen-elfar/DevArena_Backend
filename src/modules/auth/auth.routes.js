import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authLimiter } from "../../shared/middleware/rate-limit.middleware.js";
import { registerSchema, loginSchema } from "./auth.validator.js";

const router = Router();
const controller = new AuthController();

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
router.post("/refresh", (req, res, next) =>
  controller.refresh(req, res, next),
);
router.post("/logout", authenticate, (req, res, next) =>
  controller.logout(req, res, next),
);
router.get("/me", authenticate, (req, res) => controller.me(req, res));

export default router;
