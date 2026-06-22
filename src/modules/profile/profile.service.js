/**
 * modules/profile/profile.service.js
 * Handles reading and updating user profile data.
 */

import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class ProfileService {
  /**
   * Get the full profile state for the authenticated user.
   * @param {string} userId
   */
  async getMe(userId) {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        providerEmail: true,
        emailVerified: true,
        profileCompleted: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        region: true,
        major: true,
        xp: true,
        level: true,
        coins: true,
        isOnline: true,
        isVerified: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            displayName: true,
            rating: true,
            questsSolved: true,
            battlesWon: true,
            rank: { select: { name: true, color: true, iconUrl: true } },
          },
        },
        providers: {
          select: {
            provider: true,
            lastLoginAt: true,
            linkedAt: true,
          },
        },
        roles: { select: { role: { select: { name: true } } } },
      },
    });

    if (!user) throw Errors.NotFound("User not found");
    return user;
  }

  /**
   * Complete the onboarding profile for a social-auth user.
   * Marks `profileCompleted = true` once done.
   * @param {string} userId
   * @param {{ username?, major?, region?, bio? }} data
   */
  async completeOnboarding(userId, { username, major, region, bio }) {
    const prisma = getPrisma();

    // Validate username uniqueness if changing it
    if (username) {
      const conflict = await prisma.user.findFirst({
        where: { username, id: { not: userId } },
      });
      if (conflict) throw Errors.Conflict("Username already taken");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username ? { username } : {}),
        ...(major !== undefined ? { major } : {}),
        ...(region !== undefined ? { region } : {}),
        ...(bio !== undefined ? { bio } : {}),
        profileCompleted: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        major: true,
        region: true,
        bio: true,
        profileCompleted: true,
        avatarUrl: true,
      },
    });

    return updated;
  }
}
