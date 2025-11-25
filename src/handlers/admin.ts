import { MessageContext } from "puregram";
import { logger } from "../utils/logger";
import { usersApi } from "../services/api/users";
import { UserRole } from "../types/enums";
import { channelsApi } from "../services/api/channels";
import { texts } from "../texts";

class AdminHandler {
  async makeAdmin(ctx: MessageContext) {
    try {
      if (!ctx.replyToMessage) return;
      const channelId = await channelsApi.findByChatId(ctx.chatId);
      if (!channelId) {
        await ctx.send(texts.errors.channelNotFound);
        return;
      }

      const role = await usersApi.getUserRole({ tgid: ctx.from!.id, channelId });
      if (role !== UserRole.ADMIN && role !== UserRole.SUPERADMIN) {
        await ctx.send(texts.errors.notAdmin);
        return;
      }

      await usersApi.upsert({ tgid: ctx.replyToMessage!.from!.id!, channelId });
      await usersApi.updateUserRole({ tgid: ctx.replyToMessage!.from!.id!, channelId }, { role: UserRole.ADMIN });

      await ctx.send(texts.admin.newAdmin);
      logger.info("Added new admin");
    } catch (err) {
      logger.error(`failed to make admin: ${err}`);
    }
  }

  async removeAdmin(ctx: MessageContext) {
    try {
      if (!ctx.replyToMessage) return;
      const channelId = await channelsApi.findByChatId(ctx.chatId);
      if (!channelId) {
        await ctx.send(texts.errors.channelNotFound);
        return;
      }

      const role = await usersApi.getUserRole({ tgid: ctx.from!.id, channelId });
      if (role !== UserRole.ADMIN && role !== UserRole.SUPERADMIN) {
        await ctx.send(texts.errors.notAdmin);
        return;
      }

      await usersApi.upsert({ tgid: ctx.replyToMessage!.from!.id!, channelId });
      await usersApi.updateUserRole({ tgid: ctx.replyToMessage!.from!.id!, channelId }, { role: UserRole.MEMBER });

      await ctx.send(texts.admin.removeAdmin);
      logger.info("Removed admin");
    } catch (err) {
      logger.error(`failed to remove admin: ${err}`);
    }
  }
  /*async unban(ctx: MessageContext) {
    try {
      const channelId = channelStore.get().id;
      const messageId = ctx.replyToMessage!.id;

      const take = await takesApi.getTakeByMsgId({
        messageId,
        channelId
      });
      if (!take) throw new Error("Take not found");

      const author = await takesApi.getTakeAuthor({
        id: take.id,
        channelId
      });

      const tgid = author.tgid;

      await usersApi.updateUserRole(
        { tgid, channelId },
        { role: UserRole.MEMBER }
      );

      await ctx.send(texts.user.unban, {
        chat_id: author.tgid
      });

      await ctx.send(texts.admin.unban);

      logCommand("unban", ctx);
    } catch (err) {
      logger.error(`Failed to unban user: ${err}`);
      throw err;
    }
  }

  async reply(ctx: MessageContext) {
    try {
      const replyMessageId = ctx.replyToMessage!.id;
      const adminMessageId = ctx.id;
      const channelId = channelStore.get().id;

      if (ctx.text == undefined) return;

      let take = await takesApi.getTakeByMsgId({
        messageId: replyMessageId,
        channelId
      });

      if (!take) {
        const reply = await repliesApi.getByMsgId({ channelId, messageId: replyMessageId });
        if (!reply) return;

        take = await takesApi.getTakeById({
          id: reply.takeId,
          channelId
        });
        if (!take) {
          await ctx.send(texts.errors.bot)
          return
        }
      }

      const author = await takesApi.getTakeAuthor({
        id: take.id,
        channelId: channelStore.get().id
      });

      const userMessage = await ctx.send(texts.user.reply(ctx.text!, take.id), {
        chat_id: author.tgid,
        reply_parameters: {
          message_id: Number(take.userMessageId)
        }
      });

      const reply = await repliesApi.create({
        takeId: take.id,
        channelId,
        userMessageId: userMessage.id,
        adminMessageId
      });

      logger.info(reply, "Sent reply");
      await ctx.send(texts.admin.sentReply);
    } catch (err) {
      logger.error(`Failed to send reply: ${err}`);
      throw err;
    }
  }*/
}

export const adminHandler = new AdminHandler();
