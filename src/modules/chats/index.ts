import { Telegram } from "puregram";
import { ChatsController } from "./chats.controller";

const chatsController = new ChatsController();

export function registerChatsModule(telegram: Telegram) {
  telegram.updates.on("message", (ctx, next) => chatsController.registerChat(ctx, next));
  telegram.updates.on("channel_post", (ctx, next) => chatsController.registerChat(ctx, next));
}
