import { CallbackQueryContext, MessageContext } from "puregram";
import { settingsText } from "../texts";
import { settingsKeyboard } from "../keyboards";
import { logger } from "../utils/logger";
import { api } from "../services/api";
import { channelStore } from "../services/stores/channel";
import { logCbQuery } from "../utils/logs";

class UserSettings {
  async settings(ctx: MessageContext) {
    try {
      if (ctx.chatType !== "private") return;
      const { anonimity } = await api.getUsersAnonimity({ channelId: channelStore.get().id, tgid: ctx.from!.id.toString() });

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
      const { anonimity } = await api.toggleUsersAnonimity({ tgid: ctx.from!.id.toString(), channelId: channelStore.get().id });

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
