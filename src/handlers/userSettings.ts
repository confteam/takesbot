import { CallbackQueryContext, MessageContext } from "puregram";
import { texts } from "../texts";
import { userSettingsKeyboard } from "../keyboards";
import { logger } from "../utils/logger";
import { channelStore } from "../services/stores/channel";
import { logCbQuery } from "../utils/logs";
import { usersApi } from "../services/api/users";

class UserSettingsHandler {
  async settings(ctx: MessageContext) {
    try {
      if (ctx.chatType !== "private") return;
      const anonimity = await usersApi.getUserAnonimity({ channelId: channelStore.get().id, tgid: ctx.from!.id });

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
      const anonimity = await usersApi.toggleUserAnonimity({ tgid: ctx.from!.id, channelId: channelStore.get().id });

      await ctx.answer({
        text: "Успешно",
        show_alert: false
      });

      await ctx.editReplyMarkup(userSettingsKeyboard(anonimity));
    } catch (err) {
      logger.error(`Failed to toggle user's anonimity: ${err}`);
      throw err;
    }
  }
}

export const userSettingsHandler = new UserSettingsHandler();
