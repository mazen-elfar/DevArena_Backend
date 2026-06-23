import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

const profileInclude = { select: { id: true, username: true, avatar: true } };

export class CommunityService {
  async createPost(authorId, { type, title, content }) {
    const prisma = getPrisma();
    return prisma.post.create({
      data: { authorId, type, title, content },
      include: { author: profileInclude },
    });
  }

  async getPost(postId) {
    const prisma = getPrisma();
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: profileInclude,
        _count: { select: { reactions: true, comments: true, savedBy: true } },
      },
    });
    if (!post) throw Errors.NotFound("Post");
    return post;
  }

  async listPosts({ page, limit, authorId, type }) {
    const prisma = getPrisma();
    const where = { deletedAt: null, isPublished: true };
    if (authorId) where.authorId = authorId;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: profileInclude,
          _count: { select: { reactions: true, comments: true, savedBy: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async updatePost(postId, userId, data) {
    const prisma = getPrisma();
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw Errors.NotFound("Post");
    if (post.authorId !== userId) throw Errors.Forbidden("Not your post");

    return prisma.post.update({
      where: { id: postId },
      data,
      include: { author: profileInclude },
    });
  }

  async deletePost(postId, userId) {
    const prisma = getPrisma();
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw Errors.NotFound("Post");
    if (post.authorId !== userId) throw Errors.Forbidden("Not your post");

    return prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date(), isPublished: false },
    });
  }

  async toggleReaction(userId, postId, type) {
    const prisma = getPrisma();
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw Errors.NotFound("Post");

    const existing = await prisma.reaction.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      if (existing.type === type) {
        await prisma.reaction.delete({ where: { userId_postId: { userId, postId } } });
        await prisma.post.update({ where: { id: postId }, data: { reactionCount: { decrement: 1 } } });
        return { removed: true };
      }
      await prisma.reaction.update({
        where: { userId_postId: { userId, postId } },
        data: { type },
      });
      return { updated: true, type };
    }

    await prisma.reaction.create({ data: { userId, postId, type } });
    await prisma.post.update({ where: { id: postId }, data: { reactionCount: { increment: 1 } } });
    return { created: true, type };
  }

  async createComment(postId, authorId, { content, parentId }) {
    const prisma = getPrisma();
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw Errors.NotFound("Post");

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== postId) throw Errors.NotFound("Parent comment");
    }

    const comment = await prisma.comment.create({
      data: { postId, authorId, content, parentId },
      include: { author: profileInclude },
    });

    await prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });
    return comment;
  }

  async listComments(postId, { page, limit }) {
    const prisma = getPrisma();
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw Errors.NotFound("Post");

    const where = { postId, parentId: null };
    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: profileInclude,
          replies: {
            orderBy: { createdAt: "asc" },
            include: { author: profileInclude },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return { items, total, page, limit, hasMore: page * limit < total };
  }

  async toggleSave(userId, postId) {
    const prisma = getPrisma();
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw Errors.NotFound("Post");

    const existing = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.savedPost.delete({ where: { userId_postId: { userId, postId } } });
      await prisma.post.update({ where: { id: postId }, data: { saveCount: { decrement: 1 } } });
      return { saved: false };
    }

    await prisma.savedPost.create({ data: { userId, postId } });
    await prisma.post.update({ where: { id: postId }, data: { saveCount: { increment: 1 } } });
    return { saved: true };
  }

  async getTrending({ page, limit }) {
    const prisma = getPrisma();
    const now = new Date();

    const posts = await prisma.post.findMany({
      where: { deletedAt: null, isPublished: true },
      include: {
        author: profileInclude,
        _count: { select: { reactions: true, comments: true, savedBy: true } },
      },
    });

    const scored = posts.map((post) => {
      const hoursSince = (now - post.createdAt) / (1000 * 60 * 60);
      const score = (post.reactionCount * 3 + post.commentCount * 2 + post.saveCount * 5)
        / Math.pow(hoursSince + 2, 1.5);
      return { ...post, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const start = (page - 1) * limit;
    const items = scored.slice(start, start + limit);
    const total = scored.length;

    return { items, total, page, limit, hasMore: page * limit < total };
  }
}
