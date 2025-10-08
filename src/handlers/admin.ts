import { CallbackQueryContext, InputMedia, MediaSource } from "puregram";
import { logger } from "../utils/logger";
import { api } from "../services/api";
import { TakeStatus, UserRole } from "../types/enums";
import { channelStore } from "../services/stores/channel";
import { bannedWithReason, mediaGroupNotFound, takeAccepted, takeRejected } from "../texts";
import { logCbQuery } from "../utils/logs";
import { TakeAcceptParams } from "../types/params";
import { mediaGroupsStore } from "../services/stores/mediaGroups";

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
        await api.updateTakeStatus({ messageId, status: TakeStatus.REJECTED });
      } else {
        await api.updateTakeStatus({ messageId, status });
      }

      if (ctx.message?.hasText()) await ctx.editText(`${text}\n\n${takeStatusText}`);
      if (ctx.message?.hasCaption()) await ctx.editCaption(`${text}\n\n${takeStatusText}`);

      if (!ctx.message?.replyToMessage) text = this.removeTakeAuthor(text);

      const params: TakeAcceptParams = {
        ctx,
        text,
        channelChatId: channel.channelId,
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

      const { chatId, userId } = await api.getTakesAuthor({ messageId: messageId, channelId: channel.id });
      await ctx.message?.send((status === TakeStatus.ACCEPTED ? takeAccepted(messageId) : takeRejected(messageId)), {
        chat_id: chatId
      });

      if (status === "BAN") await this.ban(params, chatId, channel.id, userId);

      await ctx.answerCallbackQuery({
        text: takeStatusText,
        show_alert: false
      });

      logger.info({ messageId }, "Sent take");
    } catch (err) {
      logger.error(`Failed to handle take: ${err}`);
      throw err;
    }
  }
  private removeTakeAuthor(take: string): string {
    return take.replace(/\Тейк от:.*$/, "");
  }

  private async acceptMediaGroup({ ctx, channelChatId }: TakeAcceptParams) {
    try {
      const replyToMessage = ctx.message!.replyToMessage!;
      const inputMedias = mediaGroupsStore.find(replyToMessage.id.toString());
      if (!inputMedias) {
        await ctx.message?.send(mediaGroupNotFound);
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
      await api.updateUsersRole({
        tgid: authorId,
        channelId,
        role: UserRole.BANNED
      });

      await ctx.message?.send(bannedWithReason(ctx.message.id.toString()), {
        chat_id: chatId
      });
    } catch (err) {
      logger.error(`Failed to ban user: ${err}`);
      throw err;
    }
  }
}

export const adminHandler = new AdminHandler();
