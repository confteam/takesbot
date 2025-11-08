import { CallbackQueryContext, MediaSource, MessageContext } from "puregram";
import { logger } from "../utils/logger";
import { TakeStatus, UserRole } from "../types/enums";
import { channelStore } from "../services/stores/channel";
import { texts } from "../texts";
import { logCbQuery, logCommand } from "../utils/logs";
import { TakeAcceptParams } from "../types/params";
import { mediaGroupsStore } from "../services/stores/mediaGroups";
import { takesApi } from "../services/api/takes";
import { usersApi } from "../services/api/users";
import { removeTakeAuthor } from "../utils/adminHandler";

class AdminHandler {
  async handleTake(ctx: CallbackQueryContext) {
    try {
      logCbQuery("handle take", ctx);

      const messageId = ctx.message!.id.toString();
      let status = ctx.data;
      let text = ctx.message?.text || ctx.message?.caption || "";
      const takeStatusText = status === TakeStatus.ACCEPTED ? "✅Принято." : "❌Отклонено.";
      const channel = channelStore.get();

      if (!status) throw new Error("Callback query data is undefined");

      if (status === "BAN") {
        await takesApi.updateTakeStatus(
          { messageId, channelId: channel.id },
          { status: TakeStatus.REJECTED }
        );
      } else {
        await takesApi.updateTakeStatus(
          { messageId, channelId: channel.id },
          { status }
        );
      }

      if (ctx.message?.hasText()) await ctx.editText(`${text}\n\n${takeStatusText}`);
      if (ctx.message?.hasCaption()) await ctx.editCaption(`${text}\n\n${takeStatusText}`);

      if (!ctx.message?.replyToMessage) text = removeTakeAuthor(text);

      if (channel.decorations) text += channel.decorations;

      const params: TakeAcceptParams = {
        ctx,
        text,
        channelChatId: channel.channelChatId,
      }

      if (status === TakeStatus.ACCEPTED) {
        if (ctx.message?.replyToMessage) {
          await this.acceptMediaGroup(params);
        } else if (ctx.message?.hasAttachmentType("photo")) {
          await this.acceptPhoto(params);
        } else if (ctx.message?.hasAttachmentType("video")) {
          await this.acceptVideo(params);
        } else if (ctx.message?.hasText()) {
          await this.acceptText(params);
        }
      }

      const { chatId, userTgId } = await takesApi.getTakeAuthor({ messageId: messageId, channelId: channel.id });
      await ctx.message?.send(
        (status === TakeStatus.ACCEPTED ? texts.take.accepted(messageId) : texts.take.rejected(messageId)),
        { chat_id: chatId }
      );

      if (status === "BAN") await this.ban(params, chatId, channel.id, userTgId);

      await ctx.answerCallbackQuery({
        text: takeStatusText,
        show_alert: false
      });

      logger.info({ messageId }, "Handled take");
    } catch (err) {
      logger.error(`Failed to handle take: ${err}`);
      throw err;
    }
  }

  private async acceptMediaGroup({ ctx, channelChatId }: TakeAcceptParams) {
    try {
      const replyToMessage = ctx.message!.replyToMessage!;
      const inputMedias = mediaGroupsStore.find(replyToMessage.id.toString());
      if (!inputMedias) {
        await ctx.message?.send(texts.errors.mediaGroupNotFound);
        return;
      }

      inputMedias.inputMedias[0]!.caption = replyToMessage.caption || "";

      await ctx.message?.sendMediaGroup(inputMedias.inputMedias as any, {
        chat_id: channelChatId
      });
    } catch (err) {
      logger.error(`Failed to accept media group: ${err}`);
      throw err;
    }
  }

  private async acceptPhoto({ ctx, text, channelChatId }: TakeAcceptParams) {
    try {
      await ctx.message!.sendPhoto(MediaSource.fileId(ctx!.message!.photo![0]!.fileId), {
        chat_id: channelChatId,
        caption: text,
      });
    } catch (err) {
      logger.error(`Failed to accept photo: ${err}`);
      throw err;
    }
  }

  private async acceptVideo({ ctx, text, channelChatId }: TakeAcceptParams) {
    try {
      await ctx.message?.sendVideo(MediaSource.fileId(ctx!.message!.video!.fileId), {
        chat_id: channelChatId,
        caption: text,
      });
    } catch (err) {
      logger.error(`Failed to accept video: ${err}`);
      throw err;
    }
  }

  private async acceptText({ ctx, text, channelChatId }: TakeAcceptParams) {
    try {
      await ctx.message?.send(text, {
        chat_id: channelChatId
      })
    } catch (err) {
      logger.error(`Failed to accept text: ${err}`);
      throw err;
    }
  }

  private async ban({ ctx }: TakeAcceptParams, chatId: string, channelId: number, authorId: string) {
    try {
      await usersApi.updateUserRole(
        { tgid: authorId, channelId },
        { role: UserRole.BANNED }
      );

      await ctx.message?.send(texts.user.bannedWithReason(ctx.message.id.toString()), {
        chat_id: chatId
      });

      await ctx.message?.send(texts.admin.ban);

      logCbQuery("ban", ctx);
    } catch (err) {
      logger.error(`Failed to ban user: ${err}`);
      throw err;
    }
  }

  async unban(ctx: MessageContext) {
    try {
      const channelId = channelStore.get().id;

      const author = await takesApi.getTakeAuthor({
        messageId: ctx.replyToMessage!.id.toString(),
        channelId
      });

      const tgid = author.userTgId;

      await usersApi.updateUserRole(
        { tgid, channelId },
        { role: UserRole.MEMBER }
      );

      await ctx.send(texts.user.unban, {
        chat_id: author.chatId
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
      const messageId = ctx.replyToMessage!.id.toString();

      const author = await takesApi.getTakeAuthor({
        messageId,
        channelId: channelStore.get().id
      });

      await ctx.send(texts.user.reply(ctx.text!, messageId), {
        chat_id: author.chatId,
      });

      logger.info("Sent reply");
      await ctx.send(texts.admin.reply);
    } catch (err) {
      logger.error(`Failed to send reply: ${err}`);
      throw err;
    }
  }
}

export const adminHandler = new AdminHandler();
