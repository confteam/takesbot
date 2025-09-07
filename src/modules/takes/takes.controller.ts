import { MessageContext } from "puregram";
import { TakesService } from "./takes.service";
import { Step } from "../../common/session";
import { MyContext } from "../../common/contexts";

export class TakesController {
  takesService = new TakesService();

  async start(ctx: MessageContext) {
    const myCtx = ctx as MyContext<MessageContext>;
    myCtx.session.step = Step.CHOOSE_ANONIMITY;

    const message = this.takesService.startMessage();
    await ctx.send(message.text, {
      reply_markup: message.reply_markup
    })
  }
}
