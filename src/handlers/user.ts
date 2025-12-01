import { CallbackQueryContext, MessageContext, NextMiddleware } from "puregram";
import { logCbQuery, logCommand } from "../utils/logs";
import { texts } from "../texts";
import { addChannelKeyboard, standartKeyboard } from "../keyboards";
import { logger } from "../utils/logger";
import { nanoid } from "nanoid";
import { codeStore } from "../services/stores/codes";
import { MyContext } from "../types/context";
import { channelsApi } from "../services/api/channels";
import { usersApi } from "../services/api/users";
import { UserRole } from "../types/enums";
import { repliesApi } from "../services/api/replies";
import { checkBan } from "../utils/checkBan";
import { userSettingsHandler } from "./userSettings";

class UserHandler {
  async start(ctx: MessageContext) {
    logCommand("start", ctx);

    await ctx.send(texts.bot.start, {
      reply_markup: addChannelKeyboard
    });
  }

  async startWithId(ctx: MessageContext, next: NextMiddleware) {
    try {
      const channelId = Number(ctx.text!.split(" ")[1]);
      if (!channelId) {
        await next();
        return;
      }

      const channel = await channelsApi.findById(channelId);
      if (!channel || !channel.channelChatId) {
        await ctx.send(texts.errors.channelNotFound);
        await next();
        return;
      }

      const myCtx = ctx as MyContext<MessageContext>;
      myCtx.session.channelId = channelId;

      const chat = await ctx.telegram.api.getChat({
        chat_id: channel.channelChatId
      });
      const role = await usersApi.getUserRole({ tgid: ctx.from!.id, channelId });
      await ctx.send(texts.user.welcome(chat.username || "канал"), {
        reply_markup: standartKeyboard(role === UserRole.ADMIN)
      });

      await next();
    } catch (err) {
      logger.error(`failed to handle start with id: ${err}`);
    }
  }

  async registerChannel(ctx: CallbackQueryContext) {
    try {
      logCbQuery("register channel", ctx);

      const code = nanoid(8)

      codeStore.add(code);

      await ctx.editText(texts.bot.sendCode(code));
      await ctx.answer();
    } catch (err) {
      logger.error(`Failed to register channel: ${err}`);
    }
  }

  async reply(ctx: MessageContext) {
    try {
      const replyMessageId = ctx.replyToMessage!.id;
      const userMessageId = ctx.id;

      if (ctx.text == undefined) return;

      const match = ctx.replyToMessage!.text!.match(/№(\d+)/);
      const takeId = match ? Number(match[1]) : null;
      if (!takeId) return;

      const reply = await repliesApi.getByMsgIdAndTakeId({ messageId: replyMessageId, takeId });
      if (!reply) return;

      if (await checkBan(ctx.from!.id, reply.channelId)) {
        await ctx.send(texts.user.banned);
        return;
      }

      const channel = await channelsApi.findById(reply.channelId);
      if (!channel) {
        await ctx.send(texts.errors.channelNotFound);
        return;
      }

      const newReply = await ctx.send(texts.admin.reply(ctx.text!), {
        chat_id: channel.adminChatId,
        reply_parameters: {
          message_id: Number(reply.adminMessageId)
        }
      });

      const createdReply = await repliesApi.create({
        takeId: reply.takeId,
        channelId: reply.channelId,
        userMessageId: userMessageId,
        adminMessageId: newReply.id
      });

      logger.info(createdReply, "Sent reply");
      await ctx.send(texts.user.sentReply);
    } catch (err) {
      logger.error(`Failed to reply: ${err}`);
    }
  }
}

export const userHandler = new UserHandler();
