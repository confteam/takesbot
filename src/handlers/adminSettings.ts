import { CallbackQueryContext, MessageContext } from "puregram";
import { logger } from "../utils/logger";
import { texts } from "../texts";
import { adminSettingsKeyboard } from "../keyboards";
import { logCbQuery } from "../utils/logs";
import { MyContext } from "../types/context";
import { WaitingFor } from "../types/session";

class AdminSettingsHandler {
  async settings(ctx: MessageContext) {
    try {
      await ctx.send(texts.settings.admin.main, {
        reply_markup: adminSettingsKeyboard
      });
    } catch (err) {
      logger.error(`Failed to call admin's settings: ${err}`)
    }
  }

  async changeDecorationsButton(ctx: CallbackQueryContext) {
    try {
      logCbQuery("change decorations", ctx);

      const myCtx = ctx as MyContext<CallbackQueryContext>;

      myCtx.session.state = WaitingFor.DECORATIONS;

      await ctx.message?.send()
    } catch (err) {
      logger.error(`Failed to change decorations: ${err}`)
    }
  }
}

export const adminSettingsHandler = new AdminSettingsHandler();
