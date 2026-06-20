import Redis from "ioredis";
import { env } from "./env.js";

let redis;

export function getRedis() {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      },
    });
    redis.on("error", (err) => {
      console.error("Redis connection error:", err.message);
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
