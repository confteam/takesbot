import { CallbackQueryContext, InlineKeyboard, MessageContext } from "puregram";
import { MyContext } from "../../common/types/contexts/myContext";
import { anonimityKeyboard } from "./takes.keyboards";
import { botNotAdded, choiceResult, startText, takeSent, takeText } from "./takes.texts";
import { AnonimityPayload } from "./takes.payloads";
import { Step } from "../../common/types/session";
import { botStore } from "../../common/stores/bot.store";
import { LoggerService } from "../logger/logger.service";

export class TakesService {
  private readonly logger = new LoggerService();

  start(ctx: MessageContext) {
    this.logger.command("start", ctx);
    const bot = botStore.get();

    if (!bot.chatId || !bot.channelId) {
      return {
        text: botNotAdded(bot.code),
        replyMarkup: InlineKeyboard.empty
      }
    }

    const myCtx = ctx as MyContext<MessageContext>;
    myCtx.session.step = Step.CHOOSE_ANONIMITY;

    return {
      text: startText,
      replyMarkup: anonimityKeyboard
    }
  }

  async anonimityChoice(ctx: CallbackQueryContext) {
    this.logger.cbQuery("anonimity choice", ctx);

    let choice = ctx.data;
    if (!choice) choice = AnonimityPayload.ANON;

    const myCtx = ctx as MyContext<CallbackQueryContext>;

    myCtx.session.anonymous = choice === AnonimityPayload.ANON;
    myCtx.session.step = Step.WRITING;

    await ctx.answerCallbackQuery({ text: "success", show_alert: false });

    return {
      editedMessageText: choiceResult(choice),
      messageIdToEdit: myCtx.session.choiceMessageId,
      text: takeText,
    }
  }

  take() {
    return {
      text: takeSent,
    }
  }
}
