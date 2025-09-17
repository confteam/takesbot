import { HearManager } from "@puregram/hear";
import { MessageContext, Telegram } from "puregram";
import { TakesController } from "./takes.controller";

const takesController = new TakesController();

export function registerTakesModule(hearManager: HearManager<MessageContext>, telegram: Telegram) {
  hearManager.hear(
    "/start",
    (ctx) => takesController.handleStart(ctx),
  );

  telegram.updates.on("message", (ctx, next) => takesController.sendTakeToAdmins(ctx, next));

  telegram.updates.on("callback_query", (ctx, next) => takesController.callbackRouter(ctx, next));
}
