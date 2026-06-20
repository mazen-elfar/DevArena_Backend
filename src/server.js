import { createApp } from "./app.js";
import { getPrisma, disconnectDatabase } from "./config/database.js";
import { getRedis, disconnectRedis } from "./config/redis.js";
import { setupSocketIO } from "./socket/index.js";
import { setSocketIO } from "./modules/notifications/notifications.gateway.js";
import { setupWorkers } from "./jobs/index.js";
import http from "http";

const PORT = process.env.PORT || 5000;

async function start() {
  const prisma = getPrisma();
  await prisma.$connect();
  console.log("✓ Database connected");

  const redis = getRedis();
  await redis.ping();
  console.log("✓ Redis connected");

  const app = createApp();

  const httpServer = http.createServer(app);

  const io = setupSocketIO(httpServer);
  setSocketIO(io);
  console.log("✓ Socket.IO ready");

  setupWorkers();

  httpServer.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  });

  const shutdown = async () => {
    console.log("\nShutting down...");
    httpServer.close();
    await prisma.$disconnect();
    await disconnectRedis();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
