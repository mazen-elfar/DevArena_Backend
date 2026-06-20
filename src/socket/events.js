import { handleChatEvents } from "./handlers/chat.handler.js";
import { handleBattleEvents } from "./handlers/battle.handler.js";
import { handleNotificationEvents } from "./handlers/notification.handler.js";

export function setupEventHandlers(io, socket) {
  handleChatEvents(io, socket);
  handleBattleEvents(io, socket);
  handleNotificationEvents(io, socket);
}
