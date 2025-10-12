import { HearManager } from "@puregram/hear";
import { MessageContext, Telegram } from "puregram";
import { userHandler } from "./user";
import { SettingsPayload, TakeStatus } from "../types/enums";
import { chatHandler } from "./chat";
import { adminHandler } from "./admin";
import { userSettingsHandler } from "./userSettings";
import { texts } from "../texts";

export function registerHandlers(hm: HearManager<MessageContext>, telegram: Telegram) {
  hm.hear("/start", (ctx) => userHandler.start(ctx));
  hm.hear("/settings", (ctx) => userSettingsHandler.settings(ctx));
  hm.hear(texts.settings.main, (ctx) => userSettingsHandler.settings(ctx));

  telegram.updates.on("callback_query", (ctx) => {
    switch (ctx.data) {
      case TakeStatus.ACCEPTED:
      case TakeStatus.REJECTED:
      case "BAN":
        adminHandler.handleTake(ctx);
        break;
      case SettingsPayload.ToggleAnonimity:
        userSettingsHandler.toggleAnonimity(ctx);
      default:
        break;
    }
  });

  telegram.updates.on("message", (ctx, next) => {
    if (ctx.chatType === "private") {
      userHandler.takeMessage(ctx, next);
    } else {
      chatHandler.registerChat(ctx, next);
    };

    if (ctx.replyToMessage) {
      if (ctx.text?.includes("разбан") || ctx.text?.includes("Разбан")) {
        adminHandler.unban(ctx);
      } else {
        adminHandler.reply(ctx);
      }
    }
  });

  telegram.updates.on("channel_post", (ctx, next) => {
    chatHandler.registerChat(ctx, next);
  });
}
