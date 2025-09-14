import { MessageContext } from "puregram";
import { logger } from "../../common/logger/logger";
import { onAddToGroup } from "../../common/texts/texts";
import { onAddToChannel } from "../../common/texts/texts";
import { channelStore } from "../../common/stores/channel.store";
import { createChannel, updateChannel } from "./chats.requests";
import { BotType } from "../../common/types/enums/botType";
import { botStore } from "../../common/stores/bot.store";

export class ChatsService {
  async registerChat(ctx: MessageContext) {
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
        const newChannel = await createChannel({
          botTgId: bot.tgid,
          botType: BotType.TAKES,
          code: channel.code,
          adminChatId: channel.adminChatId,
          channelId: channel.channelId,
          discussionId: channel.discussionId
        });

        set(newChannel.channel);
      } else {
        await updateChannel({
          id: channel.id,
          adminChatId: channel.adminChatId,
          channelId: channel.channelId,
          discussionId: channel.discussionId
        });
      }

      if (isGroup) {
        return {
          text: onAddToGroup,
          chatId: ctx.chatId
        }
      } else if (isChannel && channel.adminChatId) {
        return {
          text: onAddToChannel,
          chatId: channel.adminChatId
        }
      }
    }
  }
}
