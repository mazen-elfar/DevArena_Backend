export function handleNotificationEvents(io, socket) {
  socket.on("notification:read", ({ notificationId }) => {
    socket.emit("notification:read:ack", { notificationId });
  });
}
