import Redis from "ioredis";
import { env } from "./env.js";

let redis = null;
let redisAvailable = false;

export function isRedisAvailable() {
  return redisAvailable;
}

export function getRedis() {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying
        return Math.min(times * 100, 1000);
      },
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    redis.on("connect", () => {
      redisAvailable = true;
      console.log("✓ Redis connected");
    });

    redis.on("error", (err) => {
      if (redisAvailable) {
        console.warn("⚠ Redis connection lost:", err.message);
      }
      redisAvailable = false;
    });

    redis.on("close", () => {
      redisAvailable = false;
    });
  }
  return redis;
}

export async function connectRedis() {
  try {
    const client = getRedis();
    await client.connect();
    await client.ping();
    redisAvailable = true;
  } catch (err) {
    redisAvailable = false;
    console.warn("⚠ Redis unavailable. Running in degraded mode.");
    console.warn("  Refresh tokens will be stored in-memory (not persistent across restarts).");
  }
}

export async function disconnectRedis() {
  if (redis) {
    try {
      await redis.quit();
    } catch {
      redis.disconnect();
    }
    redis = null;
    redisAvailable = false;
  }
}
