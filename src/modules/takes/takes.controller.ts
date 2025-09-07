import { CallbackQueryContext, MessageContext } from "puregram";
import { TakesService } from "./takes.service";
import { AnonimityPayload } from "./takes.payloads";

export class TakesController {
  takesService = new TakesService();

  // method to route all callbacks
  async callbackRouter(ctx: CallbackQueryContext) {
    switch (ctx.data) {
      case AnonimityPayload.ANON:
      case AnonimityPayload.NOTANON:
        this.handleAnonimityChoice(ctx);
        break;
      default:
        break;
    }
  }

  async handleStart(ctx: MessageContext) {
    const message = this.takesService.start(ctx);
    await ctx.send(message.text, {
      reply_markup: message.replyMarkup
    })
  }

  async handleAnonimityChoice(ctx: CallbackQueryContext) {
    const message = this.takesService.anonimityChoice(ctx);
    await ctx.message?.editMessageText(message.editedMessageText, {
      message_id: message.messageIdToEdit,
    });
    await ctx.message?.send(message.text);
  }
}
