import { BattlesService } from "../../modules/battles/battles.service.js";
import { MatchmakingService } from "../../modules/battles/matchmaking.service.js";
import { getPrisma } from "../../config/database.js";

const battlesService = new BattlesService();
const matchmakingService = new MatchmakingService();

export function handleBattleEvents(io, socket) {
  socket.on("battle:join", async ({ battleId }) => {
    try {
      const battle = await battlesService.joinBattle(battleId, socket.userId);
      socket.join(`battle:${battleId}`);

      io.to(`battle:${battleId}`).emit("battle:playerJoined", {
        battleId,
        userId: socket.userId,
        username: socket.username,
      });

      if (battle.status === "IN_PROGRESS") {
        io.to(`battle:${battleId}`).emit("battle:start", {
          battleId,
          quest: battle.quest,
          players: battle.players.map((p) => ({
            userId: p.userId,
            username: p.user.username,
            displayName: p.user.displayName,
            avatar: p.user.avatar,
          })),
          timeLimit: null,
        });
      }
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("battle:leave", async ({ battleId }) => {
    try {
      await battlesService.leaveBattle(battleId, socket.userId);
      socket.leave(`battle:${battleId}`);

      io.to(`battle:${battleId}`).emit("battle:playerLeft", {
        battleId,
        userId: socket.userId,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("battle:submit", async ({ battleId, sourceCode, language }) => {
    try {
      const prisma = getPrisma();

      const submissionCount = await prisma.battleSubmission.count({
        where: { battleId, userId: socket.userId },
      });

      const submission = await battlesService.submitCode(battleId, socket.userId, {
        sourceCode,
        language,
      });

      const newCount = submissionCount + 1;

      io.to(`battle:${battleId}`).emit("battle:progress", {
        battleId,
        userId: socket.userId,
        submissionCount: newCount,
        status: submission.status,
      });

      io.to(`battle:${battleId}`).emit("battle:submitted", {
        battleId,
        userId: socket.userId,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("battle:chat", async ({ battleId, message }) => {
    try {
      const prisma = getPrisma();

      const saved = await prisma.battleMessage.create({
        data: {
          battleId,
          userId: socket.userId,
          content: message,
        },
      });

      io.to(`battle:${battleId}`).emit("battle:chat", {
        battleId,
        userId: socket.userId,
        username: socket.username,
        message: saved.content,
        createdAt: saved.createdAt,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("battle:spectate", async ({ battleId }) => {
    try {
      const prisma = getPrisma();

      const battle = await prisma.battle.findUnique({ where: { id: battleId } });
      if (!battle) throw new Error("Battle not found");

      socket.join(`battle:${battleId}`);

      io.to(`battle:${battleId}`).emit("battle:spectatorJoined", {
        battleId,
        userId: socket.userId,
        username: socket.username,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("matchmaking:join", async () => {
    try {
      const prisma = getPrisma();

      const profile = await prisma.profile.findUnique({
        where: { id: socket.profileId },
      });
      if (!profile) throw new Error("Profile not found");

      await matchmakingService.joinQueue(socket.profileId, profile.rating ?? 1000);

      const status = await matchmakingService.getQueueStatus(socket.profileId);

      socket.emit("matchmaking:queued", {
        position: status?.position ?? 1,
        estimatedWait: status?.ttlRemaining ?? 120,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("matchmaking:leave", async () => {
    try {
      await matchmakingService.leaveQueue(socket.profileId);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
}
