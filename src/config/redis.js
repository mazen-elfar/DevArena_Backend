import Redis from "ioredis";
import { env } from "./env.js";

let redis;

export function getRedis() {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1, // Minimize retries to avoid hanging
      retryStrategy(times) {
        if (times > 3) {
          console.warn("⚠️ Redis unavailable. Running in degraded mode (No caching/session storage).");
          return null; // Stop retrying
        }
        return Math.min(times * 100, 1000);
      },
      showFriendlyErrorStack: true
    });

    redis.on("error", (err) => {
      // Log as warning instead of error to signify it's non-blocking
      console.warn("⚠️ Redis Warning:", err.message);
    });

    redis.on("connect", () => {
      console.log("✅ Redis connected successfully.");
    });
  }
  return redis;
}

export async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
