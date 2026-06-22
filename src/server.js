import { createApp } from "./app.js";
// Fix for BigInt serialization in JSON
BigInt.prototype.toJSON = function() { return Number(this); };
import { getPrisma, disconnectDatabase } from "./config/database.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { setupSocketIO } from "./socket/index.js";
import { setSocketIO } from "./modules/notifications/notifications.gateway.js";
import { setupWorkers } from "./jobs/index.js";
import http from "http";

const PORT = process.env.PORT || 5000;

async function start() {
  // ── Database (required) ──────────────────────────────────────────
  const prisma = getPrisma();
  await prisma.$connect();
  console.log("✓ Database connected");

  // ── Redis (optional — graceful degradation) ──────────────────────
  await connectRedis();

  // ── Express App ──────────────────────────────────────────────────
  const app = createApp();
  const httpServer = http.createServer(app);

  // ── Socket.IO ────────────────────────────────────────────────────
  const io = setupSocketIO(httpServer);
  setSocketIO(io);
  console.log("✓ Socket.IO ready");

  // ── Background Workers ───────────────────────────────────────────
  setupWorkers();

  // ── Listen ───────────────────────────────────────────────────────
  httpServer.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  });

  // ── Graceful shutdown ────────────────────────────────────────────
  const shutdown = async () => {
    console.log("\nShutting down...");
    httpServer.close();
    await disconnectDatabase();
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
