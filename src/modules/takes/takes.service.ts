import { CallbackQueryContext, MessageContext } from "puregram";
import { MyContext } from "../../common/contexts";
import { anonimityKeyboard } from "./takes.keyboards";
import { choiceResult, startText, takeText } from "./takes.texts";
import { AnonimityPayload } from "./takes.payloads";
import { Step } from "../../common/session";

export class TakesService {
  start(ctx: MessageContext) {
    const myCtx = ctx as MyContext<MessageContext>;
    myCtx.session.step = Step.CHOOSE_ANONIMITY;
    myCtx.session.choiceMessageId = ctx.id + 1;

    return {
      text: startText,
      replyMarkup: anonimityKeyboard
    }
  }

  anonimityChoice(ctx: CallbackQueryContext) {
    let choice = ctx.data;
    if (!choice) choice = AnonimityPayload.ANON;

    const myCtx = ctx as MyContext<CallbackQueryContext>;

    myCtx.session.anonymous = choice === AnonimityPayload.ANON;
    myCtx.session.step = Step.WRITING;

    ctx.answerCallbackQuery({ text: "success", show_alert: false });

    return {
      editedMessageText: choiceResult(choice),
      messageIdToEdit: myCtx.session.choiceMessageId,
      text: takeText,
    }
  }
}
