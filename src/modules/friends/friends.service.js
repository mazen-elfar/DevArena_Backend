import { getPrisma } from "../../config/database.js";
import { Errors } from "../../shared/errors/error-definitions.js";

const profileSelect = {
  id: true,
  username: true,
  displayName: true,
  avatar: true,
  bio: true,
  level: true,
  isOnline: true,
};

export class FriendsService {
  async sendRequest(requesterId, addresseeId) {
    if (requesterId === addresseeId) {
      throw Errors.BadRequest("Cannot send friend request to yourself");
    }

    const prisma = getPrisma();

    const addressee = await prisma.profile.findUnique({ where: { id: addresseeId } });
    if (!addressee) {
      throw Errors.NotFound("User");
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "PENDING") {
        throw Errors.Conflict("Friend request already pending");
      }
      if (existing.status === "ACCEPTED") {
        throw Errors.Conflict("Already friends");
      }
    }

    const friendship = await prisma.friendship.create({
      data: { requesterId, addresseeId },
      include: { requester: { select: profileSelect }, addressee: { select: profileSelect } },
    });

    await prisma.notification.create({
      data: {
        profileId: addresseeId,
        type: "FRIEND_REQUEST",
        title: "Friend Request",
        message: "sent you a friend request",
        metadata: { requesterId },
      },
    });

    return friendship;
  }

  async acceptRequest(userId, requesterId) {
    const prisma = getPrisma();

    const friendship = await prisma.friendship.findFirst({
      where: { requesterId, addresseeId: userId, status: "PENDING" },
    });
    if (!friendship) {
      throw Errors.NotFound("Pending friend request");
    }

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: "ACCEPTED" },
      include: { requester: { select: profileSelect }, addressee: { select: profileSelect } },
    });

    await prisma.notification.create({
      data: {
        profileId: requesterId,
        type: "FRIEND_ACCEPTED",
        title: "Friend Request Accepted",
        message: "accepted your friend request",
        metadata: { friendId: userId },
      },
    });

    return updated;
  }

  async rejectRequest(userId, requesterId) {
    const prisma = getPrisma();

    const friendship = await prisma.friendship.findFirst({
      where: { requesterId, addresseeId: userId, status: "PENDING" },
    });
    if (!friendship) {
      throw Errors.NotFound("Pending friend request");
    }

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: "REJECTED" },
      include: { requester: { select: profileSelect }, addressee: { select: profileSelect } },
    });

    return updated;
  }

  async removeFriend(userId, friendId) {
    const prisma = getPrisma();

    const friendship = await prisma.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId },
        ],
      },
    });
    if (!friendship) {
      throw Errors.NotFound("Friendship");
    }

    await prisma.friendship.delete({ where: { id: friendship.id } });
  }

  async listFriends(userId, { page, limit }) {
    const prisma = getPrisma();
    const skip = (page - 1) * limit;

    const where = {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    };

    const [friendships, total] = await Promise.all([
      prisma.friendship.findMany({
        where,
        include: {
          requester: { select: profileSelect },
          addressee: { select: profileSelect },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.friendship.count({ where }),
    ]);

    const friends = friendships.map((f) =>
      f.requesterId === userId ? f.addressee : f.requester,
    );

    return { items: friends, total, page, limit, hasMore: page * limit < total };
  }

  async listPendingRequests(userId) {
    const prisma = getPrisma();

    const requests = await prisma.friendship.findMany({
      where: { addresseeId: userId, status: "PENDING" },
      include: { requester: { select: profileSelect } },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }

  async followUser(followerId, followingId) {
    if (followerId === followingId) {
      throw Errors.BadRequest("Cannot follow yourself");
    }

    const prisma = getPrisma();

    const user = await prisma.profile.findUnique({ where: { id: followingId } });
    if (!user) {
      throw Errors.NotFound("User");
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      throw Errors.Conflict("Already following");
    }

    const follow = await prisma.follow.create({
      data: { followerId, followingId },
      include: { follower: { select: profileSelect }, following: { select: profileSelect } },
    });

    return follow;
  }

  async unfollowUser(followerId, followingId) {
    const prisma = getPrisma();

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!existing) {
      throw Errors.NotFound("Follow relationship");
    }

    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  }

  async listFollowers(userId, { page, limit }) {
    const prisma = getPrisma();
    const skip = (page - 1) * limit;

    const where = { followingId: userId };

    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where,
        include: { follower: { select: profileSelect } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.follow.count({ where }),
    ]);

    const followers = follows.map((f) => f.follower);

    return { items: followers, total, page, limit, hasMore: page * limit < total };
  }

  async listFollowing(userId, { page, limit }) {
    const prisma = getPrisma();
    const skip = (page - 1) * limit;

    const where = { followerId: userId };

    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where,
        include: { following: { select: profileSelect } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.follow.count({ where }),
    ]);

    const following = follows.map((f) => f.following);

    return { items: following, total, page, limit, hasMore: page * limit < total };
  }
}
