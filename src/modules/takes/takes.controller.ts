import { CallbackQueryContext, MessageContext, NextMiddleware } from "puregram";
import { TakesService } from "./takes.service";
import { AnonimityPayload } from "./takes.payloads";
import { MyContext } from "../../common/types/contexts/myContext";

export class TakesController {
  private readonly takesService = new TakesService();

  // method to route all callbacks
  async callbackRouter(ctx: CallbackQueryContext, next: NextMiddleware) {
    switch (ctx.data) {
      case AnonimityPayload.ANON:
      case AnonimityPayload.NOTANON:
        await this.handleAnonimityChoice(ctx);
        break;
      default:
        break;
    }

    await next();
  }

  async handleStart(ctx: MessageContext) {
    const message = this.takesService.start(ctx);

    const botMessage = await ctx.send(message.text, {
      reply_markup: message.replyMarkup,
    })

    const myCtx = ctx as MyContext<MessageContext>;
    myCtx.session.choiceMessageId = botMessage.id;
  }

  async handleAnonimityChoice(ctx: CallbackQueryContext) {
    const message = await this.takesService.anonimityChoice(ctx);
    await ctx.message?.editMessageText(message.editedMessageText, {
      message_id: message.messageIdToEdit,
    });
    await ctx.message?.send(message.text);
  }

  async handleTake(ctx: MessageContext, next: NextMiddleware) {
    if (ctx.chatType !== "private") return;

    const message = this.takesService.take(ctx);

    await ctx.send(message.text);

    await this.handleStart(ctx);

    await next();
  }
}
