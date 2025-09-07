import { HearManager } from "@puregram/hear";
import { MessageContext } from "puregram";
import { TakesController } from "./takes.controller";

const takesController = new TakesController();

export function registerTakesModule(hearManager: HearManager<MessageContext>) {
  hearManager.hear(
    "/start",
    (ctx: MessageContext) => takesController.start(ctx),
  );
}
