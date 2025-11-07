import { HearManager } from "@puregram/hear";
import { MessageContext, Telegram } from "puregram";
import { userHandler } from "./user";
import { UserSettingsPayload, TakeStatus, AdminSettingsPayload } from "../types/enums";
import { chatHandler } from "./chat";
import { adminHandler } from "./admin";
import { userSettingsHandler } from "./userSettings";
import { texts } from "../texts";
import { adminSettingsHandler } from "./adminSettings";
import { botStore } from "../services/stores/bot";

export function registerHandlers(hm: HearManager<MessageContext>, telegram: Telegram) {
  hm.hear("/start", (ctx) => userHandler.start(ctx));
  hm.hear("/settings", (ctx) => userSettingsHandler.settings(ctx));
  hm.hear(texts.settings.user.main, (ctx) => userSettingsHandler.settings(ctx));
  hm.hear("/adminsettings", (ctx) => adminSettingsHandler.settings(ctx));
  hm.hear(texts.settings.admin.main, (ctx) => adminSettingsHandler.settings(ctx));

  telegram.updates.on("callback_query", (ctx) => {
    switch (ctx.data) {
      case TakeStatus.ACCEPTED:
      case TakeStatus.REJECTED:
      case "BAN":
        adminHandler.handleTake(ctx);
        break;
      case "CANCEL_WAITING_FOR":
        adminSettingsHandler.cancelWaiting(ctx);
        break;
      case UserSettingsPayload.ToggleAnonimity:
        userSettingsHandler.toggleAnonimity(ctx);
        break;
      case AdminSettingsPayload.Decorations:
        adminSettingsHandler.changeDecorationsButton(ctx);
        break;
      default:
        break;
    }
  });

  telegram.updates.on("message", (ctx, next) => adminSettingsHandler.handleSetting(ctx, next));

  telegram.updates.on("message", (ctx, next) => {
    if (ctx.chatType === "private") {
      userHandler.takeMessage(ctx, next);
    } else {
      chatHandler.registerChat(ctx, next);
    };

    if (ctx.replyToMessage?.from?.id.toString() === botStore.get().tgid) {
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
