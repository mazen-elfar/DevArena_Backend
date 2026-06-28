/**
 * modules/profile/profile.service.js
 * Handles reading and updating user profile data, stats, achievements, activity, follow/unfollow.
 */

import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";
import { deleteFile, getFileUrl } from "../../shared/services/storage.service.js";

// ── Helpers ─────────────────────────────────────────────────

function convertBigInts(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return Number(obj);
  if (Array.isArray(obj)) return obj.map(convertBigInts);
  if (typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = typeof value === "bigint" ? Number(value) : convertBigInts(value);
    }
    return result;
  }
  return obj;
}

async function resolveProfileId(username) {
  const prisma = getPrisma();
  const profile = await prisma.profile.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!profile) throw Errors.NotFound("Profile");
  return profile.id;
}

// ── Service ─────────────────────────────────────────────────

export class ProfileService {
  /**
   * Get the full profile state for the authenticated user.
   * @param {string} userId — User.id (not Profile.id)
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
            id: true,
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
            currentXP: true,
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

    // Include current rank from Rank table
    let rank = null;
    if (user.profile) {
      const rankHistory = await prisma.userRankHistory.findFirst({
        where: { profileId: user.profile.id },
        orderBy: { changedAt: "desc" },
        select: { rank: { select: { name: true, color: true, iconUrl: true } } },
      });
      rank = rankHistory?.rank || null;
    }

    return convertBigInts({ ...user, rank });
  }

  /**
   * Get a public profile by username.
   * @param {string} username
   * @param {string} [requesterProfileId] — if authenticated, includes follow status
   */
  async getProfileByUsername(username, requesterProfileId) {
    const prisma = getPrisma();
    const profile = await prisma.profile.findUnique({
      where: { username },
      select: {
        id: true,
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
        currentXP: true,
        totalXP: true,
        rating: true,
        reputation: true,
        isVerified: true,
        isOnline: true,
      },
    });

    if (!profile) throw Errors.NotFound("Profile");

    // Get rank
    const rankHistory = await prisma.userRankHistory.findFirst({
      where: { profileId: profile.id },
      orderBy: { changedAt: "desc" },
      select: { rank: { select: { name: true, color: true, iconUrl: true } } },
    });

    // Get follower/following counts
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: profile.id } }),
      prisma.follow.count({ where: { followerId: profile.id } }),
    ]);

    // Check if requester follows this profile
    let isFollowing = false;
    if (requesterProfileId && requesterProfileId !== profile.id) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: requesterProfileId, followingId: profile.id } },
      });
      isFollowing = !!follow;
    }

    return convertBigInts({
      ...profile,
      rank: rankHistory?.rank || null,
      followersCount,
      followingCount,
      isFollowing,
    });
  }

  /**
   * Get aggregated statistics for a profile.
   * @param {string} username
   */
  async getStatistics(username) {
    const profileId = await resolveProfileId(username);
    const prisma = getPrisma();

    const results = await prisma.$transaction([
      prisma.submission.count({ where: { userId: profileId, status: "ACCEPTED" } }),
      prisma.battlePlayer.count({ where: { userId: profileId } }),
      prisma.battlePlayer.count({ where: { userId: profileId, isWinner: true } }),
      prisma.tournamentRegistration.count({ where: { profileId } }),
      prisma.tournamentResult.count({ where: { profileId, position: 1 } }),
      prisma.post.count({ where: { authorId: profileId } }),
      prisma.comment.count({ where: { authorId: profileId } }),
      prisma.streak.findFirst({
        where: { profileId, type: "DAILY_QUEST" },
        select: { currentStreak: true, longestStreak: true },
      }),
    ]);

    const [questsSolved, battlesPlayed, battlesWon, tournamentsPlayed, tournamentsWon, postsCount, commentsCount, streak] = results;
    const winRate = battlesPlayed > 0 ? Math.round((battlesWon / battlesPlayed) * 100) : 0;

    return {
      questsSolved,
      battlesPlayed,
      battlesWon,
      winRate,
      tournamentsPlayed,
      tournamentsWon,
      postsCount,
      commentsCount,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
    };
  }

  /**
   * Get unlocked achievements for a profile.
   * @param {string} username
   */
  async getAchievements(username) {
    const profileId = await resolveProfileId(username);
    const prisma = getPrisma();

    const userAchievements = await prisma.userAchievement.findMany({
      where: { profileId },
      include: {
        achievement: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            category: true,
            rarity: true,
            xpReward: true,
            hidden: true,
          },
        },
      },
      orderBy: { unlockedAt: "desc" },
    });

    return convertBigInts(userAchievements);
  }

  /**
   * Get activity feed for a profile.
   * Merges all activity types chronologically: posts, comments, XP logs,
   * battle results, achievement unlocks, rank changes, tournament results.
   * @param {string} username
   * @param {{ page: number, limit: number }} pagination
   */
  async getActivity(username, { page, limit }) {
    const profileId = await resolveProfileId(username);
    const prisma = getPrisma();
    const skip = (page - 1) * limit;
    const fetchLimit = limit + skip; // fetch enough for pagination

    // Fetch all activity sources in a single transaction to avoid connection pool exhaustion
    const [xpLogs, posts, comments, battlePlayers, userAchievements, rankHistory, tournamentResults, totalXp, totalPosts, totalComments, totalBattles, totalAchievements, totalRanks, totalTournaments] = await prisma.$transaction([
      prisma.xpLog.findMany({
        where: { profileId },
        select: { id: true, amount: true, source: true, description: true, referenceId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: fetchLimit,
      }),
      prisma.post.findMany({
        where: { authorId: profileId },
        select: { id: true, title: true, content: true, type: true, reactionCount: true, commentCount: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: fetchLimit,
      }),
      prisma.comment.findMany({
        where: { authorId: profileId },
        select: { id: true, content: true, postId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: fetchLimit,
      }),
      prisma.battlePlayer.findMany({
        where: { userId: profileId },
        select: { id: true, isWinner: true, joinedAt: true, battle: { select: { id: true, mode: true, quest: { select: { title: true } } } } },
        orderBy: { joinedAt: "desc" },
        take: fetchLimit,
      }),
      prisma.userAchievement.findMany({
        where: { profileId },
        select: { profileId: true, achievementId: true, unlockedAt: true, achievement: { select: { id: true, name: true, icon: true, rarity: true } } },
        orderBy: { unlockedAt: "desc" },
        take: fetchLimit,
      }),
      prisma.userRankHistory.findMany({
        where: { profileId },
        select: { id: true, oldRating: true, newRating: true, changedAt: true, rank: { select: { name: true } } },
        orderBy: { changedAt: "desc" },
        take: fetchLimit,
      }),
      prisma.tournamentResult.findMany({
        where: { profileId },
        select: { id: true, position: true, prizeWon: true, tournament: { select: { id: true, title: true } } },
        orderBy: { id: "desc" },
        take: fetchLimit,
      }),
      prisma.xpLog.count({ where: { profileId } }),
      prisma.post.count({ where: { authorId: profileId } }),
      prisma.comment.count({ where: { authorId: profileId } }),
      prisma.battlePlayer.count({ where: { userId: profileId } }),
      prisma.userAchievement.count({ where: { profileId } }),
      prisma.userRankHistory.count({ where: { profileId } }),
      prisma.tournamentResult.count({ where: { profileId } }),
    ]);

    // Normalize all into a common activity shape
    const activities = [];

    for (const log of xpLogs) {
      activities.push({
        id: `xp-${log.id}`,
        type: log.source === "QUEST" ? "QUEST_COMPLETION" : log.source === "BATTLE" ? "BATTLE_RESULT" : "ACHIEVEMENT",
        title: log.description || `${log.source} completed`,
        content: null,
        xpChange: log.amount,
        relatedId: log.referenceId,
        createdAt: log.createdAt,
      });
    }

    for (const post of posts) {
      activities.push({
        id: `post-${post.id}`,
        type: "POST",
        title: post.title || "Community Post",
        content: post.content,
        xpChange: 0,
        relatedId: post.id,
        createdAt: post.createdAt,
      });
    }

    for (const comment of comments) {
      activities.push({
        id: `comment-${comment.id}`,
        type: "COMMENT",
        title: "Commented on a post",
        content: comment.content?.slice(0, 200) || null,
        xpChange: 0,
        relatedId: comment.postId,
        createdAt: comment.createdAt,
      });
    }

    for (const bp of battlePlayers) {
      activities.push({
        id: `battle-${bp.id}`,
        type: "BATTLE_RESULT",
        title: bp.isWinner ? "Won a battle" : "Completed a battle",
        content: bp.battle?.quest?.title ? `Quest: ${bp.battle.quest.title}` : null,
        xpChange: 0,
        relatedId: bp.battle?.id,
        createdAt: bp.joinedAt,
      });
    }

    for (const ua of userAchievements) {
      activities.push({
        id: `ach-${ua.profileId}-${ua.achievementId}`,
        type: "ACHIEVEMENT",
        title: `Unlocked "${ua.achievement.name}"`,
        content: null,
        xpChange: 0,
        relatedId: String(ua.achievement.id),
        createdAt: ua.unlockedAt,
      });
    }

    for (const rh of rankHistory) {
      activities.push({
        id: `rank-${rh.id}`,
        type: "RANK_CHANGE",
        title: `Rank changed to ${rh.rank?.name || "Unknown"}`,
        content: `Rating: ${rh.oldRating} → ${rh.newRating}`,
        xpChange: 0,
        relatedId: null,
        createdAt: rh.changedAt,
      });
    }

    for (const tr of tournamentResults) {
      activities.push({
        id: `tournament-${tr.id}`,
        type: "TOURNAMENT_RESULT",
        title: tr.position === 1 ? "Won a tournament" : `Placed #${tr.position} in tournament`,
        content: tr.tournament?.title || null,
        xpChange: 0,
        relatedId: tr.tournament?.id,
        createdAt: null,
      });
    }

    // Sort all chronologically (newest first)
    activities.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = totalXp + totalPosts + totalComments + totalBattles + totalAchievements + totalRanks + totalTournaments;
    const items = activities.slice(skip, skip + limit);

    return { items: convertBigInts(items), total, page, limit, hasMore: page * limit < total };
  }

  /**
   * Get followers for a profile.
   * @param {string} username
   * @param {{ page: number, limit: number }} pagination
   */
  async getFollowers(username, { page, limit }) {
    const profileId = await resolveProfileId(username);
    const prisma = getPrisma();
    const skip = (page - 1) * limit;

    const where = { followingId: profileId };

    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where,
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              bio: true,
              level: true,
              isOnline: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.follow.count({ where }),
    ]);

    const items = follows.map((f) => f.follower);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  /**
   * Get following for a profile.
   * @param {string} username
   * @param {{ page: number, limit: number }} pagination
   */
  async getFollowing(username, { page, limit }) {
    const profileId = await resolveProfileId(username);
    const prisma = getPrisma();
    const skip = (page - 1) * limit;

    const where = { followerId: profileId };

    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where,
        include: {
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              bio: true,
              level: true,
              isOnline: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.follow.count({ where }),
    ]);

    const items = follows.map((f) => f.following);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  /**
   * Complete the onboarding profile for a social-auth user.
   * @param {string} userId
   * @param {{ username?, major?, region?, bio?, avatar? }} data
   */
  async completeOnboarding(userId, { username, major, region, bio, avatar }) {
    const prisma = getPrisma();

    if (username) {
      const conflict = await prisma.profile.findFirst({
        where: { username, userId: { not: userId } },
      });
      if (conflict) throw Errors.Conflict("Username already taken");
    }

    await prisma.profile.update({
      where: { userId },
      data: {
        ...(username ? { username } : {}),
        ...(major !== undefined ? { major } : {}),
        ...(region !== undefined ? { region } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        profileCompleted: true,
      },
    });

    return this.getMe(userId);
  }

  /**
   * Update own profile fields.
   * @param {string} userId
   * @param {object} data
   */
  async updateProfile(userId, data) {
    const prisma = getPrisma();

    // Check username uniqueness if changing
    if (data.username) {
      const conflict = await prisma.profile.findFirst({
        where: { username: data.username, userId: { not: userId } },
      });
      if (conflict) throw Errors.Conflict("Username already taken");
    }

    await prisma.profile.update({
      where: { userId },
      data,
    });

    return this.getMe(userId);
  }

  /**
   * Upload avatar — deletes previous file, saves new URL to profile.
   * @param {string} userId
   * @param {object} file — multer file object
   */
  async uploadAvatar(userId, file) {
    const prisma = getPrisma();

    if (!file) throw Errors.BadRequest("No file uploaded");

    // Get current avatar to delete old file
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { avatar: true },
    });

    // Delete old avatar
    if (profile?.avatar) {
      await deleteFile(profile.avatar);
    }

    const avatarUrl = getFileUrl(file.filename, "avatars");

    await prisma.profile.update({
      where: { userId },
      data: { avatar: avatarUrl },
    });

    return { avatar: avatarUrl };
  }

  /**
   * Upload banner — deletes previous file, saves new URL to profile.
   * @param {string} userId
   * @param {object} file
   */
  async uploadBanner(userId, file) {
    const prisma = getPrisma();

    if (!file) throw Errors.BadRequest("No file uploaded");

    // Get current banner to delete old file
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { banner: true },
    });

    // Delete old banner
    if (profile?.banner) {
      await deleteFile(profile.banner);
    }

    const bannerUrl = getFileUrl(file.filename, "banners");

    await prisma.profile.update({
      where: { userId },
      data: { banner: bannerUrl },
    });

    return { banner: bannerUrl };
  }

  /**
   * Follow a user (shortcut to friends module logic).
   * @param {string} followerId — Profile.id of the follower
   * @param {string} followingId — Profile.id of the user to follow
   */
  async followUser(followerId, followingId) {
    if (followerId === followingId) {
      throw Errors.BadRequest("Cannot follow yourself");
    }

    const prisma = getPrisma();

    const user = await prisma.profile.findUnique({ where: { id: followingId } });
    if (!user) throw Errors.NotFound("User");

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) throw Errors.Conflict("Already following");

    const follow = await prisma.follow.create({
      data: { followerId, followingId },
    });

    return convertBigInts(follow);
  }

  /**
   * Unfollow a user (shortcut to friends module logic).
   * @param {string} followerId
   * @param {string} followingId
   */
  async unfollowUser(followerId, followingId) {
    const prisma = getPrisma();

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!existing) throw Errors.NotFound("Follow relationship");

    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  }
}
