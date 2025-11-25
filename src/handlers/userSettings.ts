import { CallbackQueryContext, MessageContext } from "puregram";
import { texts } from "../texts";
import { chooseChannelKeyboard, userSettingsKeyboard } from "../keyboards";
import { logger } from "../utils/logger";
import { logCbQuery, logCommand } from "../utils/logs";
import { usersApi } from "../services/api/users";
import { MyContext } from "../types/context";
import { channelsApi } from "../services/api/channels";

class UserSettingsHandler {
  async settings(ctx: MessageContext) {
    try {
      logCommand("user settings", ctx);
      if (ctx.chatType !== "private") return;
      const myCtx = ctx as MyContext<MessageContext>;
      const channelId = myCtx.session.channelId;
      if (!channelId) return;
      const anonimity = await usersApi.getUserAnonimity({ channelId, tgid: ctx.from!.id });

      await ctx.send(texts.settings.user.main, {
        reply_markup: userSettingsKeyboard(anonimity),
      });
    } catch (err) {
      logger.error(`Failed to handle settings command: ${err}`);
      throw err;
    }
  }

  async toggleAnonimity(ctx: CallbackQueryContext) {
    try {
      logCbQuery("toggle anonimity", ctx);
      const myCtx = ctx as MyContext<CallbackQueryContext>;
      const channelId = myCtx.session.channelId;
      if (!channelId) return;

      const anonimity = await usersApi.toggleUserAnonimity({ tgid: ctx.from!.id, channelId });

      await ctx.editReplyMarkup(userSettingsKeyboard(anonimity));
      await ctx.answer();
    } catch (err) {
      logger.error(`Failed to toggle user's anonimity: ${err}`);
      throw err;
    }
  }

  async chooseChannel(ctx: MessageContext) {
    try {
      if (ctx.chatType !== "private") return;
      logCommand("choose channel", ctx);

      const channels = await channelsApi.getAllUserChannels(ctx.from!.id);
      if (!channels) {
        await ctx.send(texts.user.noChannels);
        return;
      }

      const channelsWithUsernames: { username: string, id: number }[] = await Promise.all(channels.map(async (ch) => {
        const chat = await ctx.telegram.api.getChat({ chat_id: ch.channelChatId });
        const username = chat.username || chat.first_name || "без имени";
        return { id: ch.id, username }
      }));

      await ctx.send(texts.settings.user.channel, {
        reply_markup: chooseChannelKeyboard(channelsWithUsernames)
      });
    } catch (err) {
      logger.error(`failed to choose channel: ${err}`);
    }
  }

}

export const userSettingsHandler = new UserSettingsHandler();
