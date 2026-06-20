import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

export class QuestsService {
  async listCategories() {
    const prisma = getPrisma();
    return prisma.questCategory.findMany({ orderBy: { sortOrder: "asc" } });
  }

  async getCategoryBySlug(slug) {
    const prisma = getPrisma();
    const category = await prisma.questCategory.findUnique({
      where: { slug },
      include: {
        quests: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!category) throw Errors.NotFound("Category");
    return category;
  }

  async listQuests({ page, limit, categoryId, difficulty }) {
    const prisma = getPrisma();
    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (difficulty) where.difficulty = difficulty;

    const [items, total] = await Promise.all([
      prisma.quest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { submissions: true } },
        },
      }),
      prisma.quest.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getQuest(questId) {
    const prisma = getPrisma();
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        testCases: {
          where: { isHidden: false },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { submissions: true } },
      },
    });
    if (!quest) throw Errors.NotFound("Quest");
    return quest;
  }

  async getDailyQuest() {
    const prisma = getPrisma();
    const count = await prisma.quest.count({ where: { isActive: true } });
    if (count === 0) throw Errors.NotFound("No active quests");

    const skip = Math.floor(Math.random() * count);
    const [quest] = await prisma.quest.findMany({
      where: { isActive: true },
      skip,
      take: 1,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        testCases: {
          where: { isHidden: false },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return quest;
  }

  async submitSolution(userId, questId, { language, sourceCode }) {
    const prisma = getPrisma();
    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) throw Errors.NotFound("Quest");
    if (!quest.isActive) throw Errors.BadRequest("Quest is not active");

    return prisma.submission.create({
      data: {
        userId,
        questId,
        language,
        sourceCode,
        status: "PENDING",
        submittedAt: new Date(),
      },
    });
  }

  async getMySubmissions(userId, { page, limit }) {
    const prisma = getPrisma();
    const where = { userId };

    const [items, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          quest: { select: { id: true, title: true, difficulty: true } },
        },
      }),
      prisma.submission.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async getQuestLeaderboard(questId, { page, limit }) {
    const prisma = getPrisma();
    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) throw Errors.NotFound("Quest");

    const acceptedWhere = { questId, status: "ACCEPTED" };
    const [items, total] = await Promise.all([
      prisma.submission.findMany({
        where: acceptedWhere,
        distinct: ["userId"],
        orderBy: { runtimeMs: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      }),
      prisma.submission.groupBy({
        by: ["userId"],
        where: acceptedWhere,
        _count: true,
      }),
    ]);

    const totalCount = total.length;

    return { items, total: totalCount, page, limit, hasMore: page * limit < totalCount };
  }
}
