import { Server } from "socket.io";
import { verifyAccessToken } from "../shared/utils/crypto.js";
import { getPrisma } from "../config/database.js";
import { setupEventHandlers } from "./events.js";

export function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));

      const payload = verifyAccessToken(token);
      const prisma = getPrisma();
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });

      if (!user || user.deletedAt) {
        return next(new Error("Account not available"));
      }

      socket.userId = user.id;
      socket.profileId = user.profile?.id;
      socket.username = user.profile?.username;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] ${socket.username} connected (${socket.id})`);

    socket.join(`user:${socket.userId}`);
    if (socket.profileId) {
      socket.join(`profile:${socket.profileId}`);
    }

    if (socket.profileId) {
      getPrisma().profile.update({
        where: { id: socket.profileId },
        data: { isOnline: true },
      }).catch(() => {});
    }

    setupEventHandlers(io, socket);

    socket.on("disconnect", async () => {
      console.log(`[Socket] ${socket.username} disconnected (${socket.id})`);
      if (socket.profileId) {
        await getPrisma().profile.update({
          where: { id: socket.profileId },
          data: { isOnline: false },
        }).catch(() => {});
      }
    });
  });

  return io;
}
