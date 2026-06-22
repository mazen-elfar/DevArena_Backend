/**
 * temp-code.js
 * Single-use, 5-minute auth code store for the OAuth temp-code exchange flow.
 * Uses Redis when available, falls back to an in-memory Map.
 * Each code is consumed on first read (single-use guarantee).
 */

import { getRedis, isRedisAvailable } from "../../config/redis.js";
import { randomBytes } from "crypto";

const TTL_SECONDS = 5 * 60; // 5 minutes
const PREFIX = "tmpcode:";

// In-memory fallback store: code → { userId, expiresAt }
const memStore = new Map();

// Cleanup expired codes from memory every 60 s
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of memStore) {
    if (now > val.expiresAt) memStore.delete(key);
  }
}, 60_000);

/** Generate a cryptographically random one-time code. */
export function generateTempCode() {
  return randomBytes(32).toString("hex");
}

/**
 * Store a temp code bound to a userId.
 * @param {string} userId
 * @returns {string} The generated temp code
 */
export async function storeTempCode(userId) {
  const code = generateTempCode();
  if (isRedisAvailable()) {
    const redis = getRedis();
    await redis.setex(`${PREFIX}${code}`, TTL_SECONDS, userId);
  } else {
    memStore.set(code, {
      userId,
      expiresAt: Date.now() + TTL_SECONDS * 1000,
    });
  }
  return code;
}

/**
 * Consume a temp code — returns userId if valid, null otherwise.
 * The code is deleted immediately (single-use).
 * @param {string} code
 * @returns {string|null}
 */
export async function consumeTempCode(code) {
  if (!code) return null;
  const key = `${PREFIX}${code}`;

  if (isRedisAvailable()) {
    const redis = getRedis();
    const userId = await redis.get(key);
    if (!userId) return null;
    await redis.del(key);
    return userId;
  }

  const entry = memStore.get(code);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memStore.delete(code);
    return null;
  }
  memStore.delete(code);
  return entry.userId;
}
