import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./shared/middleware/error.handler.js";
import { apiLimiter } from "./shared/middleware/rate-limit.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import communityRoutes from "./modules/community/community.routes.js";
import friendsRoutes from "./modules/friends/friends.routes.js";
import messagingRoutes from "./modules/messaging/messaging.routes.js";
import questsRoutes from "./modules/quests/quests.routes.js";
import battlesRoutes from "./modules/battles/battles.routes.js";
import tournamentsRoutes from "./modules/tournaments/tournaments.routes.js";
import rankingRoutes from "./modules/ranking/ranking.routes.js";
import gamificationRoutes from "./modules/gamification/gamification.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import paymentsRoutes from "./modules/payments/payments.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      process.env.DASHBOARD_URL || "http://localhost:5174",
    ],
    credentials: true,
  }));
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", apiLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/posts", communityRoutes);
  app.use("/api/friends", friendsRoutes);
  app.use("/api/conversations", messagingRoutes);
  app.use("/api/quests", questsRoutes);
  app.use("/api/battles", battlesRoutes);
  app.use("/api/tournaments", tournamentsRoutes);
  app.use("/api/ranking", rankingRoutes);
  app.use("/api/gamification", gamificationRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/analytics", analyticsRoutes);

  app.use(errorHandler);

  return app;
}
