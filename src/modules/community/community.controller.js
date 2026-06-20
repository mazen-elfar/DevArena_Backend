import { CommunityService } from "./community.service.js";
import { sendSuccess } from "../../shared/utils/api-response.js";

const communityService = new CommunityService();

export class CommunityController {
  async createPost(req, res, next) {
    try {
      const post = await communityService.createPost(req.user.id, req.body);
      return sendSuccess(res, post, "Post created", 201);
    } catch (error) {
      next(error);
    }
  }

  async getPost(req, res, next) {
    try {
      const post = await communityService.getPost(req.params.id);
      return sendSuccess(res, post);
    } catch (error) {
      next(error);
    }
  }

  async listPosts(req, res, next) {
    try {
      const { page, limit, authorId, type } = req.query;
      const result = await communityService.listPosts({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        authorId,
        type,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req, res, next) {
    try {
      const post = await communityService.updatePost(req.params.id, req.user.id, req.body);
      return sendSuccess(res, post, "Post updated");
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      await communityService.deletePost(req.params.id, req.user.id);
      return sendSuccess(res, null, "Post deleted");
    } catch (error) {
      next(error);
    }
  }

  async toggleReaction(req, res, next) {
    try {
      const result = await communityService.toggleReaction(req.user.id, req.params.id, req.body.type);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createComment(req, res, next) {
    try {
      const comment = await communityService.createComment(req.params.id, req.user.id, req.body);
      return sendSuccess(res, comment, "Comment created", 201);
    } catch (error) {
      next(error);
    }
  }

  async listComments(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await communityService.listComments(req.params.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async toggleSave(req, res, next) {
    try {
      const result = await communityService.toggleSave(req.user.id, req.params.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getTrending(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await communityService.getTrending({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
