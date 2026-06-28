import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class RankingService {
  async updateRating(profileId, won, opponentRating) {
    const prisma = getPrisma();

    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw Errors.NotFound("Profile");

    const k = profile.level < 30 ? 40 : profile.level <= 100 ? 25 : 15;
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - profile.rating) / 400));
    const actualScore = won ? 1 : 0;
    const newRating = Math.max(0, Math.round(profile.rating + k * (actualScore - expectedScore)));

    const oldRating = profile.rating;

    // Get old rank before update
    const oldRank = await prisma.rank.findFirst({
      where: {
        minRating: { lte: profile.rating },
        maxRating: { gte: profile.rating },
      },
    });

    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: {
        rating: newRating,
      },
    });

    // Get new rank after update
    const newRank = await prisma.rank.findFirst({
      where: {
        minRating: { lte: newRating },
        maxRating: { gte: newRating },
      },
    });

    const rankChanged = oldRank?.id !== newRank?.id;

    await prisma.userRankHistory.create({
      data: {
        profileId,
        rankId: newRank?.id ?? null,
        oldRating,
        newRating,
      },
    });

    return {
      profile: updatedProfile,
      oldRating,
      newRating,
      oldRank: oldRank ? { id: oldRank.id, name: oldRank.name, color: oldRank.color } : null,
      newRank: newRank ? { id: newRank.id, name: newRank.name, color: newRank.color } : null,
      rankChanged,
    };
  }

  async getLeaderboard({ page, limit }) {
    const prisma = getPrisma();

    const [items, total] = await Promise.all([
      prisma.profile.findMany({
        orderBy: { rating: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          rating: true,
          level: true,
        },
      }),
      prisma.profile.count(),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getRankHistory(profileId) {
    const prisma = getPrisma();

    const history = await prisma.userRankHistory.findMany({
      where: { profileId },
      orderBy: { changedAt: "desc" },
      include: {
        rank: { select: { id: true, name: true, color: true, iconUrl: true } },
      },
    });

    return history;
  }

  async getUserRank(profileId) {
    const prisma = getPrisma();

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        rating: true,
        level: true,
      },
    });

    if (!profile) throw Errors.NotFound("Profile");

    const rank = await prisma.rank.findFirst({
      where: {
        minRating: { lte: profile.rating },
        maxRating: { gte: profile.rating },
      },
    });

    return { ...profile, rank };
  }

  async getAllRanks() {
    const prisma = getPrisma();

    const ranks = await prisma.rank.findMany({
      orderBy: { order: "asc" },
    });

    return ranks;
  }
}
