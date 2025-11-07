import { CallbackQueryContext, MessageContext, NextMiddleware } from "puregram";
import { logger } from "../utils/logger";
import { texts } from "../texts";
import { adminSettingsKeyboard, cancelWaitingKeyboard } from "../keyboards";
import { logCbQuery } from "../utils/logs";
import { MyContext } from "../types/context";
import { WaitingFor } from "../types/session";
import { channelStore } from "../services/stores/channel";
import { usersApi } from "../services/api/users";
import { UserRole } from "../types/enums";
import { channelsApi } from "../services/api/channels";

class AdminSettingsHandler {
  async settings(ctx: MessageContext) {
    try {
      const channel = channelStore.get();

      const role = await usersApi.getUserRole({
        channelId: channel.id,
        tgid: ctx.from!.id.toString()
      });

      if (role !== UserRole.ADMIN && role !== UserRole.SUPERADMIN) {
        await ctx.send(texts.errors.notAdmin);
        return;
      }

      await ctx.send(texts.settings.admin.main, {
        reply_markup: adminSettingsKeyboard
      });
    } catch (err) {
      logger.error(`Failed to call admin's settings: ${err}`);
    }
  }

  async cancelWaiting(ctx: CallbackQueryContext) {
    try {
      const myCtx = ctx as MyContext<CallbackQueryContext>;

      myCtx.session.state = null;

      await ctx.message?.send(texts.bot.start);

      await ctx.answerCallbackQuery({
        show_alert: false
      });
    } catch (err) {
      logger.error(`Failed to cancel waiting: ${err}`);
    }
  }

  async handleSetting(ctx: MessageContext, next: NextMiddleware) {
    try {
      const myCtx = ctx as MyContext<MessageContext>;

      switch (myCtx.session.state) {
        case null:
          await next();
          break;
        case WaitingFor.DECORATIONS:
          await this.changeDecorations(ctx);
          break;
      }

      myCtx.session.state = null;
    } catch (err) {
      logger.error(`Failed to handle setting: ${err}`);
    }
  }

  async changeDecorationsButton(ctx: CallbackQueryContext) {
    try {
      logCbQuery("change decorations", ctx);

      const myCtx = ctx as MyContext<CallbackQueryContext>;

      myCtx.session.state = WaitingFor.DECORATIONS;

      const decorations = channelStore.get().decorations;

      await ctx.message?.send(texts.settings.admin.changeDecorations(decorations), {
        reply_markup: cancelWaitingKeyboard
      });

      await ctx.answerCallbackQuery({
        show_alert: false
      });
    } catch (err) {
      logger.error(`Failed to handle change decorations button: ${err}`);
    }
  }

  async changeDecorations(ctx: MessageContext) {
    try {
      const channel = channelStore.get();

      channelStore.update({
        decorations: ctx.text!
      });

      await channelsApi.update(channel.id, {
        decorations: channel.decorations,
        adminChatId: channel.adminChatId,
        discussionChatId: channel.discussionChatId,
        channelChatId: channel.channelChatId
      });

      await ctx.send(texts.settings.admin.changeDecorations(ctx.text!));
      await ctx.send(texts.bot.start);
    } catch (err) {
      logger.error(`Failed to change decorations: ${err}`);
    }
  }
}

export const adminSettingsHandler = new AdminSettingsHandler();
