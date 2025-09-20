import { HearManager } from "@puregram/hear";
import { MessageContext, Telegram } from "puregram";
import { userHandler } from "./user";
import { AnonimityPayload } from "../types/enums";
import { chatHandler } from "./chat";

export function registerHandlers(hm: HearManager<MessageContext>, telegram: Telegram) {
  hm.hear("/start", (ctx) => userHandler.start(ctx));

  telegram.updates.on("callback_query", (ctx) => {
    switch (ctx.data) {
      case AnonimityPayload.ANON:
      case AnonimityPayload.NOTANON:
        userHandler.anonimityChoice(ctx);
      default:
        break;
    }
  });

  telegram.updates.on("message", (ctx, next) => {
    if (ctx.chatType === "private") {
      userHandler.takeText(ctx, next);
    } else {
      chatHandler.registerChat(ctx, next);
    };
  });

  telegram.updates.on("channel_post", (ctx, next) => {
    chatHandler.registerChat(ctx, next);
  })
}
