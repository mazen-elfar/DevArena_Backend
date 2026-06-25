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
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
            banner: true,
            bio: true,
            university: true,
            major: true,
            graduationYear: true,
            country: true,
            region: true,
            githubUsername: true,
            githubUrl: true,
            linkedinUrl: true,
            portfolioUrl: true,
            websiteUrl: true,
            level: true,
            totalXP: true,
            rating: true,
            reputation: true,
            profileCompleted: true,
            isVerified: true,
            isOnline: true,
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
    
    // Flatten for consistent API response if needed, 
    // but here we keep the structure and just fix BigInt
    if (user.profile) {
      if (typeof user.profile.totalXP === "bigint") user.profile.totalXP = Number(user.profile.totalXP);
      if (typeof user.profile.currentXP === "bigint") user.profile.currentXP = Number(user.profile.currentXP);
    }
    
    return user;
  }

  /**
   * Complete the onboarding profile for a social-auth user.
   * Marks `profileCompleted = true` once done.
   * @param {string} userId
   * @param {{ username?, major?, region?, bio?, avatar? }} data
   */
  async completeOnboarding(userId, { username, major, region, bio, avatar }) {
    const prisma = getPrisma();

    // Validate username uniqueness if changing it
    if (username) {
      const conflict = await prisma.profile.findFirst({
        where: { username, userId: { not: userId } },
      });
      if (conflict) throw Errors.Conflict("Username already taken");
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: userId },
      data: {
        ...(username ? { username } : {}),
        ...(major !== undefined ? { major } : {}),
        ...(region !== undefined ? { region } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        profileCompleted: true,
      },
    });

    // Return fixed up user object
    return this.getMe(userId);
  }
}
