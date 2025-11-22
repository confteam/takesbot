import { MessageContext, NextMiddleware } from "puregram";
import { channelStore } from "../services/stores/channel";
import { botStore } from "../services/stores/bot";
import { logger } from "../utils/logger";
import { BotType } from "../types/enums";
import { texts } from "../texts";
import { channelsApi } from "../services/api/channels";

class ChatHandler {
  async registerChat(ctx: MessageContext, next: NextMiddleware) {
    const { update, set } = channelStore;
    const channel = channelStore.get();

    const bot = botStore.get();

    const isNewChannel = channel.id === 0;

    if (channel.code === ctx.text) {
      const isGroup = ctx.chatType === "group" || ctx.chatType === "supergroup";
      const isChannel = ctx.chatType === "channel";

      if (isGroup && channel.adminChatId === 0) {
        update({ adminChatId: ctx.chat.id });

        logger.info(`Registered group ${ctx.chat.id}`);
      } else if (isChannel && channel.channelChatId === 0) {
        update({ channelChatId: ctx.chat.id });

        logger.info(`Registered channel ${ctx.chat.id}`);
      }

      if (isNewChannel) {
        const newChannel = await channelsApi.create({
          botTgId: bot.tgid,
          botType: BotType.TAKES,
          code: channel.code,
          adminChatId: channel.adminChatId,
          channelChatId: channel.channelChatId,
          discussionsChatId: channel.discussionsChatId
        });

        set(newChannel);
      } else {
        await channelsApi.update(channel.id, {
          decorations: channel.decorations,
          adminChatId: channel.adminChatId,
          channelChatId: channel.channelChatId,
          discussionsChatId: channel.discussionsChatId
        });
      }

      if (isGroup) {
        await ctx.send(texts.bot.onAddToGroup);
      } else if (isChannel && channel.adminChatId) {
        await ctx.send(texts.bot.onAddToChannel, {
          chat_id: channel.adminChatId
        });
      }
    }

    await next();
  }
}

export const chatHandler = new ChatHandler();
