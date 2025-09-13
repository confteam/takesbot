import { Telegram } from "puregram";
import { ChatsController } from "./chats.controller";

const chatsController = new ChatsController();

export function registerChatsModule(telegram: Telegram) {
  telegram.updates.on("message", (ctx) => chatsController.registerChat(ctx));
  telegram.updates.on("channel_post", (ctx) => chatsController.registerChat(ctx));
}
