import { CallbackQueryContext, InlineKeyboard, MessageContext } from "puregram";
import { MyContext } from "../../common/types/contexts/myContext";
import { anonimityKeyboard, takeKeyboard } from "./takes.keyboards";
import { botNotAdded, choiceResult, startText, takeSent, takeText } from "./takes.texts";
import { AnonimityPayload } from "./takes.types";
import { Step } from "../../common/types/session";
import { logCommand, logCbQuery } from "../../common/helpers/logs";
import { channelStore } from "../../common/stores/channel.store";
import { createTake } from "./takes.requests";
import { logger } from "../../common/logger/logger";
import { CreateTakeDto } from "./takes.types";

export class TakesService {
  start(ctx: MessageContext) {
    logCommand("start", ctx);
    const channel = channelStore.get();

    if (!channel.adminChatId || !channel.channelId) {
      return {
        text: botNotAdded(channel.code),
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
    logCbQuery("anonimity choice", ctx);

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

  private async createTake(ctx: MessageContext): Promise<CreateTakeDto | null> {
    try {
      const channel = channelStore.get();

      const myCtx = ctx as MyContext<MessageContext>;
      if (myCtx.session.step !== Step.WRITING) {
        await ctx.send("zalupa idi nahuy");
        return null;
      };

      const take: CreateTakeDto = {
        userTgId: ctx.from!.id.toString(),
        messageId: ctx.id.toString(),
        channelId: channel.id
      };

      await createTake(take);
      logger.info({ take }, "Created take");

      return take;
    } catch (err) {
      logger.error(`Failed to create take: ${err}`);
      throw err;
    }
  }

  async takeText(ctx: MessageContext) {
    try {
      const channel = channelStore.get();
      const myCtx = ctx as MyContext<MessageContext>;

      if (channel.adminChatId === "") return { text: botNotAdded(channel.code) };
      if (!ctx.text) return { text: "zalupa idi nahuy" };

      const take = await this.createTake(ctx);
      if (!take) throw new Error("Take is null");

      if (myCtx.session.anonymous) {
        await ctx.send(ctx.text, {
          chat_id: channel.adminChatId,
          reply_markup: takeKeyboard
        });
      } else {
        await ctx.forward({
          message_id: Number(take.messageId),
          chat_id: channel.adminChatId,
          from_chat_id: ctx.chatId
        });
      }

      return {
        text: takeSent,
      }
    } catch (err) {
      logger.error(`Failed to send take: ${err}`);
      throw err;
    }
  }
}
