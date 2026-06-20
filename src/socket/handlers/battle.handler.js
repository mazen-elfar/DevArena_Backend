import { BattlesService } from "../../modules/battles/battles.service.js";

const battlesService = new BattlesService();

export function handleBattleEvents(io, socket) {
  socket.on("battle:join", async ({ battleId }) => {
    try {
      await battlesService.joinBattle(battleId, socket.userId);
      socket.join(`battle:${battleId}`);
      io.to(`battle:${battleId}`).emit("battle:playerJoined", {
        battleId,
        userId: socket.userId,
        username: socket.username,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("battle:submit", async ({ battleId, sourceCode, language }) => {
    try {
      const submission = await battlesService.submitCode(battleId, socket.userId, { sourceCode, language });
      io.to(`battle:${battleId}`).emit("battle:progress", {
        battleId,
        userId: socket.userId,
        submissionCount: 1,
        lastStatus: submission.status,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("battle:chat", ({ battleId, message }) => {
    io.to(`battle:${battleId}`).emit("battle:chat", {
      battleId,
      userId: socket.userId,
      username: socket.username,
      message,
    });
  });
}
