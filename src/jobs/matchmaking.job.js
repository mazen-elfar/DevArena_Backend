import { Worker } from "bullmq";
import { getRedis } from "../config/redis.js";
import { MatchmakingService } from "../modules/battles/matchmaking.service.js";

const matchmakingService = new MatchmakingService();

export function setupMatchmakingWorker() {
  // Run matchmaking every 2 seconds
  const interval = setInterval(async () => {
    try {
      await matchmakingService.findMatches();
    } catch (error) {
      console.error("[Matchmaking] Error:", error.message);
    }
  }, 2000);

  // Cleanup on process exit
  process.on("SIGINT", () => clearInterval(interval));
  process.on("SIGTERM", () => clearInterval(interval));
}
