import { Queue } from "bullmq";
import { getRedis } from "../config/redis.js";
import { setupEmailWorker } from "./email.job.js";
import { setupMatchmakingWorker } from "./matchmaking.job.js";
import { setupDailyQuestWorker } from "./daily-quest.job.js";

const connection = getRedis();

export const emailQueue = new Queue("email", { connection });
export const matchmakingQueue = new Queue("matchmaking", { connection });

export function setupWorkers() {
  setupEmailWorker();
  setupMatchmakingWorker();
  setupDailyQuestWorker();
  console.log("✓ Background workers started");
}
