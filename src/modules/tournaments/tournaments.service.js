import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class TournamentsService {
  async createTournament(adminId, data) {
    const prisma = getPrisma();
    return prisma.tournament.create({
      data: {
        name: data.name,
        type: data.type,
        status: "UPCOMING",
        maxParticipants: data.maxParticipants || null,
        entryFee: data.entryFee || null,
        prizePool: data.prizePool || null,
        description: data.description || null,
        rules: data.rules || null,
        startsAt: new Date(data.startsAt),
      },
    });
  }

  async register(userId, tournamentId) {
    const prisma = getPrisma();

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!tournament) throw Errors.NotFound("Tournament");
    if (tournament.status !== "REGISTRATION" && tournament.status !== "UPCOMING") {
      throw Errors.BadRequest("Tournament is not accepting registrations");
    }

    const existing = await prisma.tournamentRegistration.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    });
    if (existing) throw Errors.Conflict("Already registered for this tournament");

    if (tournament.maxParticipants && tournament._count.registrations >= tournament.maxParticipants) {
      throw Errors.BadRequest("Tournament is full");
    }

    return prisma.tournamentRegistration.create({
      data: { tournamentId, userId },
    });
  }

  async listTournaments({ page, limit, status, type }) {
    const prisma = getPrisma();
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startsAt: "asc" },
        include: {
          _count: { select: { registrations: true, participants: true } },
        },
      }),
      prisma.tournament.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getTournament(tournamentId) {
    const prisma = getPrisma();
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
        brackets: { orderBy: [{ round: "asc" }, { match: "asc" }] },
        _count: { select: { registrations: true, participants: true } },
      },
    });
    if (!tournament) throw Errors.NotFound("Tournament");
    return tournament;
  }

  async getBrackets(tournamentId) {
    const prisma = getPrisma();

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) throw Errors.NotFound("Tournament");

    const brackets = await prisma.bracket.findMany({
      where: { tournamentId },
      orderBy: [{ round: "asc" }, { match: "asc" }],
    });

    const rounds = {};
    for (const bracket of brackets) {
      if (!rounds[bracket.round]) rounds[bracket.round] = [];
      rounds[bracket.round].push(bracket);
    }

    return { tournamentId, rounds };
  }

  async updateBracket(bracketId, winnerId, battleId) {
    const prisma = getPrisma();

    const bracket = await prisma.bracket.findUnique({ where: { id: bracketId } });
    if (!bracket) throw Errors.NotFound("Bracket");

    return prisma.bracket.update({
      where: { id: bracketId },
      data: {
        winnerId,
        battleId,
        status: "COMPLETED",
      },
    });
  }

  async getResults(tournamentId) {
    const prisma = getPrisma();

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) throw Errors.NotFound("Tournament");

    const results = await prisma.tournamentResult.findMany({
      where: { tournamentId },
      orderBy: { position: "asc" },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    return { tournamentId, results };
  }
}
