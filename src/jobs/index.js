import { Queue } from "bullmq";
import { getRedis, isRedisAvailable } from "../config/redis.js";
import { setupEmailWorker } from "./email.job.js";
import { setupMatchmakingWorker } from "./matchmaking.job.js";
import { setupDailyQuestWorker } from "./daily-quest.job.js";

// Queues are initialized lazily in setupWorkers()
export let emailQueue = null;
export let matchmakingQueue = null;

/**
 * Initialize queues only if Redis is available.
 */
function initQueues() {
  if (isRedisAvailable() && !emailQueue) {
    const connection = getRedis();
    emailQueue = new Queue("email", { connection });
    matchmakingQueue = new Queue("matchmaking", { connection });
  }
}

/**
 * Initialize all background workers and queues.
 * Skips if Redis is unavailable to prevent startup crashes.
 */
export function setupWorkers() {
  if (!isRedisAvailable()) {
    console.warn("⚠ Redis unavailable. Background workers and BullMQ queues disabled.");
    return;
  }

  try {
    initQueues();
    setupEmailWorker();
    setupMatchmakingWorker();
    setupDailyQuestWorker();
    console.log("✓ Background workers started");
  } catch (err) {
    console.error("✗ Failed to setup workers:", err.message);
  }
}

