import { MessageContext } from "puregram";
import { logCommand } from "../utils/logs";
import { MyContext } from "../types/context";
import { texts } from "../texts";
import { userSettingsHandler } from "./userSettings";
import { logger } from "../utils/logger";
import { cancelWaitingKeyboard } from "../keyboards";
import { WaitingFor } from "../types/session";
import { channelsApi } from "../services/api/channels";

class UserMpHandler {
  async mpPrompt(ctx: MessageContext) {
    try {
      logCommand("mp prompt", ctx);

      const myCtx = ctx as MyContext<MessageContext>;
      const channelId = myCtx.session.channelId;
      if (!channelId) {
        await ctx.send(texts.errors.channelNotFound);
        await userSettingsHandler.chooseChannel(ctx);
        return;
      }

      await ctx.send(texts.mp.prompt, {
        reply_markup: cancelWaitingKeyboard
      });
      myCtx.session.state = WaitingFor.MP;
    } catch (err) {
      logger.error(`Failed to ask mp: ${err}`);
    }
  }

  async sendMp(ctx: MessageContext) {
    try {
      const myCtx = ctx as MyContext<MessageContext>;
      const channelId = myCtx.session.channelId;
      if (!channelId) {
        await ctx.send(texts.errors.channelNotFound);
        await userSettingsHandler.chooseChannel(ctx);
        return;
      }

      const channel = await channelsApi.findById(channelId);
      if (!channel) {
        await ctx.send(texts.errors.channelNotFound);
        await userSettingsHandler.chooseChannel(ctx);
        return;
      }

      const msg = await ctx.forward({
        from_chat_id: ctx.chatId,
        chat_id: channel.adminChatId,
        message_id: ctx.id
      });
      await ctx.send(texts.mp.new, {
        chat_id: channel.adminChatId,
        reply_parameters: {
          message_id: msg.id
        }
      });
      await ctx.send(texts.mp.sent);
    } catch (err) {
      logger.error(`Failed to send mp: ${err}`);
    }
  }
}

export const userMpHandler = new UserMpHandler();
