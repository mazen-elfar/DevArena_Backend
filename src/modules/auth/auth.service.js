import { getPrisma } from "../../config/database.js";
import { getRedis, isRedisAvailable } from "../../config/redis.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
} from "../../shared/utils/crypto.js";
import { Errors } from "../../shared/errors/error-definitions.js";
import { consumeTempCode, storeTempCode } from "./temp-code.js";

// In-memory fallback when Redis is unavailable
// Key: refreshToken  →  Value: { userId, expiresAt }
const tokenStore = new Map();

function memStore_set(token, userId, ttlSeconds) {
  tokenStore.set(token, {
    userId,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function memStore_get(token) {
  const entry = tokenStore.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    tokenStore.delete(token);
    return null;
  }
  return entry.userId;
}

function memStore_del(token) {
  tokenStore.delete(token);
}

export class AuthService {
  constructor() {
    this._roleCache = new Map();
  }

  async register({ username, email, password }) {
    const prisma = getPrisma();
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw Errors.Conflict("Email already in use");

    const existingProfile = await prisma.profile.findUnique({ where: { username } });
    if (existingProfile) throw Errors.Conflict("Username already taken");

    const passwordHash = await hashPassword(password);

    const roleId = await this._getDefaultRoleId();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            username,
            displayName: username,
          },
        },
        roles: {
          create: { roleId },
        },
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
        profile: true,
      },
    });

    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user.id, tokens.refreshToken);
    return { user: this._sanitizeUser(user), ...tokens };
  }

  async login({ email, password }) {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: true } },
        profile: true,
      },
    });
    if (!user) throw Errors.Unauthorized("Invalid credentials");
    if (user.deletedAt) throw Errors.Unauthorized("Account is deleted");

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw Errors.Unauthorized("Invalid credentials");

    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user.id, tokens.refreshToken);
    await prisma.profile.update({
      where: { userId: user.id },
      data: { isOnline: true },
    });
    return { user: this._sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken) {
    if (!refreshToken) throw Errors.Unauthorized("Refresh token required");

    let userId;

    if (isRedisAvailable()) {
      const redis = getRedis();
      userId = await redis.get(`refresh:${refreshToken}`);
    } else {
      userId = memStore_get(refreshToken);
    }

    if (!userId) throw Errors.Unauthorized("Invalid or expired refresh token");

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
        profile: true,
      },
    });
    if (!user || user.deletedAt) {
      await this._deleteRefreshToken(refreshToken);
      throw Errors.Unauthorized("Account not available");
    }

    await this._deleteRefreshToken(refreshToken);
    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId, refreshToken) {
    if (refreshToken) await this._deleteRefreshToken(refreshToken);
    const prisma = getPrisma();
    await prisma.profile.update({
      where: { userId: userId },
      data: { isOnline: false },
    });
  }

  _generateTokens(user) {
    const payload = {
      sub: user.id,
      username: user.profile?.username,
      roles: user.roles.map((ur) => ur.role.name),
    };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken();
    return { accessToken, refreshToken };
  }

  async _storeRefreshToken(userId, token) {
    const TTL = 7 * 24 * 60 * 60; // 7 days in seconds
    if (isRedisAvailable()) {
      const redis = getRedis();
      await redis.setex(`refresh:${token}`, TTL, userId);
    } else {
      memStore_set(token, userId, TTL);
    }
  }

  async _deleteRefreshToken(token) {
    if (isRedisAvailable()) {
      const redis = getRedis();
      await redis.del(`refresh:${token}`);
    } else {
      memStore_del(token);
    }
  }

  _sanitizeUser(user) {
    if (!user) return null;
    // eslint-disable-next-line no-unused-vars
    const { passwordHash, roles: userRoles, ...safe } = user;
    
    // Flatten roles and extract permissions
    const roles = userRoles?.map((ur) => ur.role.name) || [];
    const permissions = [...new Set(
      userRoles?.flatMap(ur =>
        ur.role.permissions?.map(rp => rp.permissionId) || []
      ) || []
    )];

    // Simplify profile and handle BigInt
    let profile = null;
    if (safe.profile) {
      profile = {
        ...safe.profile,
        currentXP: typeof safe.profile.currentXP === "bigint" ? Number(safe.profile.currentXP) : safe.profile.currentXP,
        totalXP: typeof safe.profile.totalXP === "bigint" ? Number(safe.profile.totalXP) : safe.profile.totalXP,
      };
    }
    
    return {
      ...safe,
      profile,
      roles,
      permissions
    };
  }

  // ─── Social Auth ───────────────────────────────────────────────────────────

  /**
   * Find or create a user from a social provider profile.
   * Priority:
   *   1. Match by (provider, providerUid) — existing linked account.
   *   2. Match by email — link provider to existing local account.
   *   3. Create a brand-new user.
   *
   * @param {{ provider, providerUid, email, name, avatarUrl, accessToken, refreshToken }} profile
   * @returns {{ user, isNew: boolean }}
   */
  async findOrCreateSocialUser({ provider, providerUid, email, name, avatarUrl, accessToken, refreshToken }) {
    const prisma = getPrisma();
    const now = new Date();

    // 1. Existing provider link
    const existingProvider = await prisma.userProvider.findUnique({
      where: { provider_providerUid: { provider, providerUid } },
      include: {
        user: {
          include: {
            roles: { include: { role: true } },
            profile: true,
          },
        },
      },
    });

    if (existingProvider) {
      // Update tokens + lastLoginAt
      await prisma.userProvider.update({
        where: { id: existingProvider.id },
        data: { accessToken, refreshToken, lastLoginAt: now },
      });
      return { user: existingProvider.user, isNew: false };
    }

    // 2. Existing user by email — link this provider
    if (email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email },
        include: {
          roles: { include: { role: true } },
          profile: true,
        },
      });

      if (userByEmail) {
        await prisma.userProvider.create({
          data: {
            userId: userByEmail.id,
            provider,
            providerUid,
            accessToken,
            refreshToken,
            lastLoginAt: now,
          },
        });
        return { user: userByEmail, isNew: false };
      }
    }

    // 3. Create new user
    const username = await this._generateUsername(name ?? email ?? "user");
    const resolvedEmail = email ?? `${provider.toLowerCase()}_${providerUid}@noemail.devarena.io`;

    const roleId = await this._getDefaultRoleId();

    const newUser = await prisma.user.create({
      data: {
        email: resolvedEmail,
        emailVerified: !!email,
        profile: {
          create: {
            username,
            displayName: name || username,
            avatar: avatarUrl,
            profileCompleted: false,
          },
        },
        roles: {
          create: { roleId },
        },
        providers: {
          create: {
            provider,
            providerUid,
            accessToken,
            refreshToken,
            lastLoginAt: now,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
        profile: true,
      },
    });

    return { user: newUser, isNew: true };
  }

  /**
   * Consume a one-time temp code and issue JWT tokens.
   * Called by the frontend after the social OAuth redirect.
   * @param {string} code
   * @returns {{ user, accessToken, refreshToken }}
   */
  async exchangeSocialCode(code) {
    const userId = await consumeTempCode(code);
    if (!userId) throw Errors.Unauthorized("Invalid or expired auth code");

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
        profile: true,
      },
    });
    if (!user || user.deletedAt) throw Errors.Unauthorized("Account not available");

    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user.id, tokens.refreshToken);
    return { user: this._sanitizeUser(user), ...tokens };
  }

  /**
   * Issue a short-lived temp code for a social-auth user (server → frontend redirect).
   * @param {string} userId
   * @returns {string} code
   */
  async issueTempCode(userId) {
    return storeTempCode(userId);
  }

  /**
   * Generate a unique username from a display name.
   * Sanitizes the name, appends a random 4-digit suffix on conflicts.
   * Retries up to 10 times before falling back to a timestamp-based name.
   * @param {string} base
   * @returns {string}
   */
  async _generateUsername(base) {
    const prisma = getPrisma();
    const sanitized = base
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 30) || "user";

    for (let i = 0; i < 10; i++) {
      const suffix = i === 0 ? "" : `_${Math.floor(1000 + Math.random() * 9000)}`;
      const candidate = `${sanitized}${suffix}`.slice(0, 50);
      const existing = await prisma.profile.findUnique({ where: { username: candidate } });
      if (!existing) return candidate;
    }

    return `user_${Date.now()}`.slice(0, 50);
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  async _getDefaultRoleId() {
    if (this._roleCache.has("USER")) return this._roleCache.get("USER");

    const prisma = getPrisma();
    const role = await prisma.role.findUnique({ where: { name: "USER" } });
    if (!role) {
      console.error("✗ Critical error: Role 'USER' not found in database.");
      throw Errors.Internal("Platform roles not initialized. Please run seeds.");
    }

    this._roleCache.set("USER", role.id);
    return role.id;
  }

}

// Singleton export
export const authService = new AuthService();

