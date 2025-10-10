import { CallbackQueryContext, MessageContext } from "puregram";
import { settingsText } from "../texts";
import { settingsKeyboard } from "../keyboards";
import { logger } from "../utils/logger";
import { channelStore } from "../services/stores/channel";
import { logCbQuery } from "../utils/logs";
import { usersApi } from "../services/api/users";

class UserSettings {
  async settings(ctx: MessageContext) {
    try {
      if (ctx.chatType !== "private") return;
      const anonimity = await usersApi.getUserAnonimity({ channelId: channelStore.get().id, tgid: ctx.from!.id.toString() });

      await ctx.send(settingsText, {
        reply_markup: settingsKeyboard(anonimity),
      });
    } catch (err) {
      logger.error(`Failed to handle settings command: ${err}`);
      throw err;
    }
  }

  async toggleAnonimity(ctx: CallbackQueryContext) {
    try {
      logCbQuery("toggle anonimity", ctx);
      const anonimity = await usersApi.toggleUserAnonimity({ tgid: ctx.from!.id.toString(), channelId: channelStore.get().id });

      await ctx.answer({
        text: "Успешно",
        show_alert: false
      });

      await ctx.editReplyMarkup(settingsKeyboard(anonimity));
    } catch (err) {
      logger.error(`Failed to toggle user's anonimity: ${err}`);
      throw err;
    }
  }
}

export const userSettingsHandler = new UserSettings();
