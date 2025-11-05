import { MessageContext } from "puregram";
import { logger } from "../utils/logger";
import { texts } from "../texts";
import { adminSettingsKeyboard } from "../keyboards";

class AdminSettingsHandler {
  async settings(ctx: MessageContext) {
    try {
      await ctx.send(texts.settings.main, {
        reply_markup: adminSettingsKeyboard
      });
    } catch (err) {
      logger.error(`Failed to call admin's settings`)
    }
  }
}

export const adminSettingsHandler = new AdminSettingsHandler();
