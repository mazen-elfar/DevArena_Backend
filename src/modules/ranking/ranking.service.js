import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class RankingService {
  calculateElo(winnerRating, loserRating, winnerGamesPlayed) {
    const k = winnerGamesPlayed < 30 ? 40 : winnerGamesPlayed <= 100 ? 25 : 15;
    const expectedScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    return Math.round(winnerRating + k * (1 - expectedScore));
  }

  async updateRating(userId, won, opponentRating) {
    const prisma = getPrisma();

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw Errors.NotFound("Profile");

    const k = profile.battlesWon < 30 ? 40 : profile.battlesWon <= 100 ? 25 : 15;
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - profile.rating) / 400));
    const actualScore = won ? 1 : 0;
    const newRating = Math.max(0, Math.round(profile.rating + k * (actualScore - expectedScore)));

    const oldRating = profile.rating;
    const oldRankId = profile.rankId;

    const newRank = await prisma.rank.findFirst({
      where: {
        minRating: { lte: newRating },
        maxRating: { gte: newRating },
      },
    });

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        rating: newRating,
        rankId: newRank?.id ?? profile.rankId,
        ...(won ? { battlesWon: { increment: 1 } } : {}),
      },
    });

    await prisma.userRankHistory.create({
      data: {
        userId,
        rankId: newRank?.id ?? profile.rankId,
        oldRating,
        newRating,
      },
    });

    return {
      profile: updatedProfile,
      oldRating,
      newRating,
      oldRankId,
      newRankId: newRank?.id ?? profile.rankId,
      rankChanged: oldRankId !== (newRank?.id ?? profile.rankId),
    };
  }

  async getLeaderboard({ page, limit }) {
    const prisma = getPrisma();

    const [items, total] = await Promise.all([
      prisma.profile.findMany({
        orderBy: { rating: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
          rank: { select: { id: true, name: true, color: true, iconUrl: true } },
        },
      }),
      prisma.profile.count(),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getRankHistory(userId) {
    const prisma = getPrisma();

    const history = await prisma.userRankHistory.findMany({
      where: { userId },
      orderBy: { changedAt: "desc" },
      include: {
        rank: { select: { id: true, name: true, color: true, iconUrl: true } },
      },
    });

    return history;
  }

  async getUserRank(userId) {
    const prisma = getPrisma();

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        rank: { select: { id: true, name: true, color: true, iconUrl: true, minRating: true, maxRating: true } },
      },
    });

    if (!profile) throw Errors.NotFound("Profile");

    return profile;
  }

  async getAllRanks() {
    const prisma = getPrisma();

    const ranks = await prisma.rank.findMany({
      orderBy: { order: "asc" },
    });

    return ranks;
  }
}
