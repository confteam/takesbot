import { InputMedia, MediaSource, MessageContext, NextMiddleware } from "puregram";
import { logger } from "../utils/logger";
import { usersApi } from "../services/api/users";
import { UserRole } from "../types/enums";
import { channelsApi } from "../services/api/channels";
import { texts } from "../texts";
import { takesApi } from "../services/api/takes";
import { repliesApi } from "../services/api/replies";
import { logCommand } from "../utils/logs";
import { WaitingFor } from "../types/session";
import { adminSettingsHandler } from "./adminSettings";
import { MyContext } from "../types/context";
import { userSettingsHandler } from "./userSettings";
import { cancelWaitingKeyboard } from "../keyboards";
import { userMpHandler } from "./userMpHandler";

class AdminHandler {
  async handleCommand(ctx: MessageContext, next: NextMiddleware) {
    try {
      const myCtx = ctx as MyContext<MessageContext>;

      switch (myCtx.session.state) {
        case null:
          await next();
          break;
        case WaitingFor.DECORATIONS:
          await adminSettingsHandler.changeDecorations(ctx);
          break;
        case WaitingFor.BROADCAST:
          await this.sendBroadcast(ctx);
          break;
        case WaitingFor.MP:
          await userMpHandler.sendMp(ctx);
          break;
      }

      myCtx.session.state = null;
    } catch (err) {
      logger.error(`Failed to handle setting: ${err}`);
    }
  }

  async broadcast(ctx: MessageContext) {
    try {
      logCommand("broadcast", ctx);

      const myCtx = ctx as MyContext<MessageContext>;
      const channelId = myCtx.session.channelId;
      if (!channelId) {
        await ctx.send(texts.errors.channelNotFound);
        await userSettingsHandler.chooseChannel(ctx);
        return;
      }
      const role = await usersApi.getUserRole({ tgid: ctx.from!.id, channelId })
      if (role !== UserRole.ADMIN) {
        await ctx.send(texts.errors.notAdmin);
        return;
      }

      await ctx.send(texts.user.broadcast, {
        reply_markup: cancelWaitingKeyboard
      });
      myCtx.session.state = WaitingFor.BROADCAST;
    } catch (err) {
      logger.error(`failed to send broadcast: ${err}`);
    }
  }

  async sendBroadcast(ctx: MessageContext) {
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
        return;
      }
      const chat = await ctx.telegram.api.getChat({
        chat_id: channel.channelChatId
      });
      const users = await usersApi.getAllUsersInChannel(channelId);
      for (const user of users) {
        let msg;
        if (ctx.isMediaGroup()) {
          const inputMedias = ctx.mediaGroup!.attachments.map((att, index) => {
            if (att!.is("photo")) {
              return InputMedia.photo(MediaSource.fileId(att.bigSize.fileId), {
                caption: index === 0 && ctx.caption ? ctx.caption : "",
              });
            }
            if (att?.is("video")) {
              return InputMedia.video(MediaSource.fileId(att.fileId), {
                caption: index === 0 && ctx.caption ? ctx.caption : "",
              });
            }
            return null;
          }).filter(Boolean);

          const msgs = await ctx.sendMediaGroup(inputMedias as any, {
            chat_id: user
          });
          msg = msgs[0];
        } else {
          msg = await ctx.telegram.api.copyMessage({
            message_id: ctx.id,
            from_chat_id: ctx.chatId,
            chat_id: user
          });
        }

        await ctx.send(texts.user.broadcastFrom(chat.username || chat.first_name || "канала"), {
          reply_parameters: { message_id: msg?.id },
          chat_id: user
        });
      }

      await ctx.send(texts.user.broadcastSent);
    } catch (err) {
      logger.error(`failed to send broadcast: ${err}`);
    }
  }

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

  async unban(ctx: MessageContext) {
    try {
      logCommand("unban", ctx);
      const channelId = await channelsApi.findByChatId(ctx.chatId);
      if (!channelId) {
        await ctx.send(texts.errors.channelNotFound);
        return;
      }
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
    } catch (err) {
      logger.error(`Failed to unban user: ${err}`);
      throw err;
    }
  }

  async reply(ctx: MessageContext) {
    try {
      const replyMessageId = ctx.replyToMessage!.id;
      const adminMessageId = ctx.id;

      const channelId = await channelsApi.findByChatId(ctx.chatId);
      if (!channelId) {
        await ctx.send(texts.errors.channelNotFound);
        return;
      }

      if (ctx.text == undefined) return;

      let take = await takesApi.getTakeByMsgId({
        messageId: replyMessageId,
        channelId
      });

      if (!take) {
        const reply = await repliesApi.getByMsgIdAndChannelId({ channelId, messageId: replyMessageId });
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
        channelId
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
  }

}

export const adminHandler = new AdminHandler();
