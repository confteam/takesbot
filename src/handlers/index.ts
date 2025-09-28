import { HearManager } from "@puregram/hear";
import { MessageContext, Telegram } from "puregram";
import { userHandler } from "./user";
import { SettingsPayload, TakeStatus } from "../types/enums";
import { chatHandler } from "./chat";
import { adminHandler } from "./admin";
import { userSettingsHandler } from "./userSettings";
import { settingsText } from "../texts";

export function registerHandlers(hm: HearManager<MessageContext>, telegram: Telegram) {
  hm.hear("/start", (ctx) => userHandler.start(ctx));
  hm.hear("/settings", (ctx) => userSettingsHandler.settings(ctx));
  hm.hear(settingsText, (ctx) => userSettingsHandler.settings(ctx));

  telegram.updates.on("callback_query", (ctx) => {
    switch (ctx.data) {
      case TakeStatus.ACCEPTED:
      case TakeStatus.REJECTED:
        if (ctx.message?.hasText()) {
          adminHandler.acceptTakeText(ctx);
        }
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
  });

  telegram.updates.on("channel_post", (ctx, next) => {
    chatHandler.registerChat(ctx, next);
  });
}
