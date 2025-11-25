import { MessageContext, NextMiddleware } from "puregram";
import { logger } from "../utils/logger";
import { codeStore } from "../services/stores/codes";
import { channelsApi } from "../services/api/channels";
import { CreateChannelDto, UpdateChannelDto } from "../types/api/channels";
import { texts } from "../texts";
import { usersApi } from "../services/api/users";
import { UserRole } from "../types/enums";

class ChatHandler {
  async register(ctx: MessageContext, next: NextMiddleware) {
    try {
      if (!ctx.text) {
        await next();
        return;
      }

      const isCodeExists = codeStore.find(ctx.text);
      if (!isCodeExists) {
        await next();
        return
      }

      const isGroup = ctx.chatType === "group";
      const existingChannel = await channelsApi.findByCode(ctx.text);
      const botUsername = (await ctx.telegram.api.getMe()).username;
      let id: number = 0;
      let adminChatId: number = 0;

      if (!existingChannel) {
        let channel: CreateChannelDto;

        channel = {
          adminChatId: (isGroup ? ctx.chatId : 0),
          channelChatId: (isGroup ? 0 : ctx.chatId),
          discussionsChatId: 0,
          code: ctx.text
        }

        adminChatId = channel.adminChatId;
        id = await channelsApi.create(channel);
        logger.info(channel, "Created channel");
      } else {
        let channel: UpdateChannelDto;

        channel = {
          adminChatId: (isGroup ? ctx.chatId : existingChannel.adminChatId),
          channelChatId: (isGroup ? existingChannel.channelChatId : ctx.chatId),
          discussionsChatId: 0,
          decorations: existingChannel.decorations,
        };

        adminChatId = channel.adminChatId;
        id = existingChannel.id;
        await channelsApi.update(existingChannel.id, channel);
        logger.info(channel, "Updated channel");
      }

      if (isGroup) {
        await ctx.telegram.api.sendMessage({
          text: texts.bot.onAddToGroup(id, botUsername || ""),
          chat_id: ctx.chatId
        });

        await usersApi.upsert({
          channelId: id,
          tgid: ctx.from?.id!
        });
        await usersApi.updateUserRole({ tgid: ctx.from?.id!, channelId: id }, { role: UserRole.ADMIN });
      } else if (!isGroup && adminChatId) {
        await ctx.telegram.api.sendMessage({
          text: texts.bot.onAddToChannel(id, botUsername || ""),
          chat_id: adminChatId
        });
      }
      await next();
    } catch (err) {
      logger.error(`failed to register chat: ${err}`);
    }
  }
}

export const chatHandler = new ChatHandler();
