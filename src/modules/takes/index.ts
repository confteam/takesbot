import { HearManager } from "@puregram/hear";
import { MessageContext, Telegram } from "puregram";
import { TakesController } from "./takes.controller";

const takesController = new TakesController();

export function registerTakesModule(hearManager: HearManager<MessageContext>, telegram: Telegram) {
  hearManager.hear(
    "/start",
    (ctx: MessageContext) => takesController.handleStart(ctx),
  );

  telegram.updates.on("message", (ctx) => takesController.handleTake(ctx));

  telegram.updates.on("callback_query", (ctx) => takesController.callbackRouter(ctx));
}
