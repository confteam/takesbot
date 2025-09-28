import { MessageContext, NextMiddleware } from "puregram";
import { logCommand } from "../utils/logs";
import { channelStore } from "../services/stores/channel";
import { botNotAdded, startText, takeAuthor, takeSent } from "../texts";
import { standartKeyboard, takeKeyboard } from "../keyboards";
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

    await ctx.send(startText, {
      reply_markup: standartKeyboard
    });
  }

  async takeText(ctx: MessageContext, next: NextMiddleware) {
    try {
      const channel = channelStore.get();

      if (channel.adminChatId === "") return { text: botNotAdded(channel.code) };
      if (!ctx.text) return { text: "zalupa idi nahuy" };

      const { anonimity } = await api.getUsersAnonimity({ tgid: ctx.from!.id.toString(), channelId: channel.id });

      let take: CreateTakeDto = {
        userTgId: ctx.from!.id.toString(),
        messageId: "",
        channelId: channel.id,
      };

      const takeText = anonimity ? ctx.text : `${ctx.text}\n\n${takeAuthor(ctx.from?.username || "")}`

      const message = await ctx.send(takeText, {
        chat_id: channel.adminChatId,
        reply_markup: takeKeyboard
      });

      take.messageId = message.id.toString();
      await this.createTake(take);

      await ctx.send(takeSent(take.messageId));

      await next();
    } catch (err) {
      logger.error(`Failed to send take: ${err}`);
      throw err;
    }
  }

  private async createTake(take: CreateTakeDto) {
    try {
      await api.createTake(take);
      logger.info({ take }, "Created take");
    } catch (err) {
      logger.error(`Failed to create take: ${err}`);
      throw err;
    }
  }
}

export const userHandler = new UserHandler();
