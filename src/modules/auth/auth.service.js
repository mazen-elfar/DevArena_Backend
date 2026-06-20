import { getPrisma } from "../../config/database.js";
import { getRedis } from "../../config/redis.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
} from "../../shared/utils/crypto.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class AuthService {
  async register({ username, email, password }) {
    const prisma = getPrisma();
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      if (existing.email === email)
        throw Errors.Conflict("Email already in use");
      throw Errors.Conflict("Username already taken");
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        profile: { create: {} },
        roles: { create: { roleId: 1 } },
      },
      include: { roles: { include: { role: true } } },
    });

    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user.id, tokens.refreshToken);
    return { user: this._sanitizeUser(user), ...tokens };
  }

  async login({ email, password }) {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw Errors.Unauthorized("Invalid credentials");
    if (user.isBanned) throw Errors.Unauthorized("Account is banned");
    if (user.deletedAt) throw Errors.Unauthorized("Account is deleted");

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw Errors.Unauthorized("Invalid credentials");

    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user.id, tokens.refreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true },
    });
    return { user: this._sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken) {
    const redis = getRedis();
    const userId = await redis.get(`refresh:${refreshToken}`);
    if (!userId) throw Errors.Unauthorized("Invalid refresh token");

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user || user.isBanned || user.deletedAt) {
      await redis.del(`refresh:${refreshToken}`);
      throw Errors.Unauthorized("Account not available");
    }

    await redis.del(`refresh:${refreshToken}`);
    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId, refreshToken) {
    const redis = getRedis();
    if (refreshToken) await redis.del(`refresh:${refreshToken}`);
    const prisma = getPrisma();
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: false },
    });
  }

  _generateTokens(user) {
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles.map((ur) => ur.role.name),
    };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken();
    return { accessToken, refreshToken };
  }

  async _storeRefreshToken(userId, token) {
    const redis = getRedis();
    await redis.setex(`refresh:${token}`, 7 * 24 * 60 * 60, userId);
  }

  _sanitizeUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
