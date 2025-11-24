import { HearManager } from "@puregram/hear";
import { MessageContext, Telegram } from "puregram";
import { userHandler } from "./user";
import { chatHandler } from "./chat";
import { logger } from "../utils/logger";

export function registerHandlers(hm: HearManager<MessageContext>, telegram: Telegram) {
  hm.hear("/start", (ctx) => userHandler.start(ctx));
  /*hm.hear("/settings", (ctx) => userSettingsHandler.settings(ctx));
  hm.hear(texts.settings.user.main, (ctx) => userSettingsHandler.settings(ctx));
  hm.hear("/adminsettings", (ctx) => adminSettingsHandler.settings(ctx));
  hm.hear(texts.settings.admin.main, (ctx) => adminSettingsHandler.settings(ctx));*/

  telegram.updates.on("callback_query", (ctx) => {
    switch (ctx.data) {
      case "REGISTER_CHANNEL":
        userHandler.registerChannel(ctx);
        break;
      /*case TakeStatus.ACCEPTED:
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
        break;*/
    }
  });

  //telegram.updates.on("message", (ctx, next) => adminSettingsHandler.handleSetting(ctx, next));

  telegram.updates.on("message", (ctx, next) => {
    if (ctx.replyToMessage?.from?.id === ctx.telegram.bot.id) {
      if (ctx.chatType === "group") {
        if (ctx.text?.includes("разбан") || ctx.text?.includes("Разбан")) {
          //adminHandler.unban(ctx);
        } else {
          //adminHandler.reply(ctx);
        }
      } else if (ctx.chatType === "private") {
        //userHandler.reply(ctx);
      }
    } else {
      if (ctx.chatType === "private") {
        if (/^\/start\s+\S+$/.test(ctx.text!)) {
          userHandler.startWithId(ctx, next);
        }
        //userHandler.takeMessage(ctx, next);
      } else {
        chatHandler.register(ctx, next);
      };
    }
  });

  telegram.updates.on("channel_post", (ctx, next) => {
    chatHandler.register(ctx, next);
  });
}
