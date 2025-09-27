import { HearManager } from "@puregram/hear";
import { MessageContext, Telegram } from "puregram";
import { userHandler } from "./user";
import { AnonimityPayload, TakeStatus } from "../types/enums";
import { chatHandler } from "./chat";
import { adminHandler } from "./admin";

export function registerHandlers(hm: HearManager<MessageContext>, telegram: Telegram) {
  hm.hear("/start", (ctx) => userHandler.start(ctx));

  telegram.updates.on("callback_query", (ctx) => {
    switch (ctx.data) {
      case AnonimityPayload.ANON:
      case AnonimityPayload.NOTANON:
        userHandler.anonimityChoice(ctx);
        break;
      case TakeStatus.ACCEPTED:
      case TakeStatus.REJECTED:
        if (ctx.message?.hasText()) {
          adminHandler.acceptTakeText(ctx);
        }
        break;
      default:
        break;
    }
  });

  telegram.updates.on("message", (ctx, next) => {
    if (ctx.chatType === "private") {
      if (ctx.hasText()) {
        userHandler.takeText(ctx, next);
      }
    } else {
      chatHandler.registerChat(ctx, next);
    };
  });

  telegram.updates.on("channel_post", (ctx, next) => {
    chatHandler.registerChat(ctx, next);
  })
}
