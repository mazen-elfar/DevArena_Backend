let io = null;

export function setSocketIO(socketIO) {
  io = socketIO;
}

export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitNotification(userId, notification) {
  emitToUser(userId, "notification:new", notification);
}
