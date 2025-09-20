import { CallbackQueryContext, MessageContext, NextMiddleware } from "puregram";
import { logCommand, logCbQuery } from "../utils/logs";
import { channelStore } from "../services/stores/channel";
import { botNotAdded, choiceResult, startText, takeAuthor, takeSent, takeText } from "../texts";
import { anonimityKeyboard, takeKeyboard } from "../keyboards";
import { Step } from "../types/session";
import { MyContext } from "../types/contexts";
import { AnonimityPayload } from "../types/enums";
import { CreateTakeDto } from "../types/api";
import { logger } from "../utils/logger";
import { api } from "../services/api";

class UserHandler {
  async start(ctx: MessageContext) {
    logCommand("start", ctx);
    const channel = channelStore.get();

    if (!channel.adminChatId || !channel.channelId) {
      await ctx.send(botNotAdded(channel.code));
      return;
    }

    const myCtx = ctx as MyContext<MessageContext>;
    myCtx.session.step = Step.CHOOSE_ANONIMITY;

    const botMessage = await ctx.send(startText, anonimityKeyboard);
    myCtx.session.choiceMessageId = botMessage.id;
  }

  async anonimityChoice(ctx: CallbackQueryContext) {
    logCbQuery("anonimity choice", ctx);

    let choice = ctx.data;
    if (!choice) choice = AnonimityPayload.ANON;

    const myCtx = ctx as MyContext<CallbackQueryContext>;

    myCtx.session.anonymous = choice === AnonimityPayload.ANON;
    myCtx.session.step = Step.WRITING;

    let cbText = myCtx.session.anonymous ? "Анонимно" : "Неанонимно";

    await ctx.answerCallbackQuery({ text: cbText, show_alert: false });

    if (myCtx.session.choiceMessageId) {
      await ctx.message?.editMessageText(choiceResult(choice), {
        message_id: myCtx.session.choiceMessageId,
      });
    } else {
      await ctx.message?.send(choiceResult(choice));
    }

    await ctx.message?.send(takeText);
  }

  async takeText(ctx: MessageContext, next: NextMiddleware) {
    try {
      const channel = channelStore.get();
      const myCtx = ctx as MyContext<MessageContext>;

      if (channel.adminChatId === "") return { text: botNotAdded(channel.code) };
      if (!ctx.text) return { text: "zalupa idi nahuy" };

      const take = await this.createTake(ctx);
      if (!take) throw new Error("Take is null");

      await ctx.send(ctx.text, {
        chat_id: channel.adminChatId,
        reply_markup: takeKeyboard
      });

      if (!myCtx.session.anonymous) {
        await ctx.send(takeAuthor(ctx.from?.username || ""), {
          chat_id: channel.adminChatId
        });
      }

      await ctx.send(takeSent);

      await this.start(ctx);
      await next();
    } catch (err) {
      logger.error(`Failed to send take: ${err}`);
      throw err;
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

      await api.createTake(take);
      logger.info({ take }, "Created take");

      return take;
    } catch (err) {
      logger.error(`Failed to create take: ${err}`);
      throw err;
    }
  }
}

export const userHandler = new UserHandler();
