import { MessageContext, NextMiddleware } from "puregram";
import { channelStore } from "../services/stores/channel";
import { botStore } from "../services/stores/bot";
import { logger } from "../utils/logger";
import { api } from "../services/api";
import { BotType } from "../types/enums";
import { onAddToChannel, onAddToGroup } from "../texts";

class ChatHandler {
  async registerChat(ctx: MessageContext, next: NextMiddleware) {
    const { update, set } = channelStore;
    const channel = channelStore.get();

    const bot = botStore.get();

    const isNewChannel = channel.id === 0;

    if (channel.code === ctx.text) {
      const isGroup = ctx.chatType === "group" || ctx.chatType === "supergroup";
      const isChannel = ctx.chatType === "channel";

      if (isGroup && !channel.adminChatId) {
        update({ adminChatId: ctx.chat.id.toString() });

        logger.info(`Registered group ${ctx.chat.id}`);
      } else if (isChannel && !channel.channelId) {
        update({ channelId: ctx.chat.id.toString() });

        logger.info(`Registered channel ${ctx.chat.id}`);
      }

      if (isNewChannel) {
        const newChannel = await api.createChannel({
          botTgId: bot.tgid,
          botType: BotType.TAKES,
          code: channel.code,
          adminChatId: channel.adminChatId,
          channelId: channel.channelId,
          discussionId: channel.discussionId
        });

        set(newChannel.channel);
      } else {
        await api.updateChannel({
          id: channel.id,
          adminChatId: channel.adminChatId,
          channelId: channel.channelId,
          discussionId: channel.discussionId
        });
      }

      if (isGroup) {
        await ctx.send(onAddToGroup);
      } else if (isChannel && channel.adminChatId) {
        await ctx.send(onAddToChannel, {
          chat_id: channel.adminChatId
        });
      }
    }

    await next();
  }
}

export const chatHandler = new ChatHandler();
