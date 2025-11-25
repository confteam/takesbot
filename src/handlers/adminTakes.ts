import { CallbackQueryContext, MediaSource } from "puregram";
import { TakeAcceptParams } from "../types/params";
import { logger } from "../utils/logger";
import { texts } from "../texts";
import { mediaGroupsStore } from "../services/stores/mediaGroups";
import { TakeStatus, UserRole } from "../types/enums";
import { takesApi } from "../services/api/takes";
import { removeTakeAuthor } from "../utils/adminHandler";
import { logCbQuery } from "../utils/logs";
import { usersApi } from "../services/api/users";

class AdminTakesHandler {
  async handleTake(ctx: CallbackQueryContext) {
    try {
      logCbQuery("handle take", ctx);

      const messageId = ctx.message!.id; //айди тейка в чате админов
      let status = ctx.data; //отклонен / принят / бан
      let text = ctx.message?.text || ctx.message?.caption || ""; //текст / описание
      const takeStatusText = status === TakeStatus.ACCEPTED ? "✅Принято." : "❌Отклонено."; // текст статуса взависимости от статуса
      const channel = channelStore.get();

      if (!status) throw new Error("Callback query data is undefined");

      // получаем тейк из бд
      const take = await takesApi.getTakeByMsgId({
        messageId: messageId,
        channelId: channel.id
      });
      if (!take) throw new Error("Take not found");

      // если забанили ставим что тейк отклонен
      if (status === "BAN") {
        await takesApi.updateTakeStatus(
          { id: take.id, channelId: channel.id },
          { status: TakeStatus.REJECTED }
        );
        // если не забанили ставим статус тейка отколонен / принят
      } else {
        await takesApi.updateTakeStatus(
          { id: take.id, channelId: channel.id },
          { status }
        );
      }

      // добавляем статус тейка в админ чате
      if (ctx.message?.hasText()) await ctx.editText(`${text}\n\n${takeStatusText}`);
      if (ctx.message?.hasCaption()) await ctx.editCaption(`${text}\n\n${takeStatusText}`);

      // удаляем из текста в переменной автора если это не медиа группа
      if (!ctx.message?.replyToMessage) text = removeTakeAuthor(text);

      // добавляем к тексту в переменной декорации если есть
      if (channel.decorations) text += channel.decorations;

      // создаем параметры
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

      // получаем автора тейка
      const { tgid } = await takesApi.getTakeAuthor({ id: take.id, channelId: channel.id });
      // отправяем ему уведомление что тейк принят / отклонен
      await ctx.message?.send(
        (status === TakeStatus.ACCEPTED ? texts.take.accepted(take.id) : texts.take.rejected(take.id)),
        { chat_id: tgid }
      );

      // если забанили то отправляем автору что он забанен
      if (status === "BAN") await this.ban(params, channel.id, tgid);

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

  private async ban({ ctx }: TakeAcceptParams, channelId: number, tgid: number) {
    try {
      await usersApi.updateUserRole(
        { tgid, channelId },
        { role: UserRole.BANNED }
      );

      const messageId = ctx.message!.id;
      const take = await takesApi.getTakeByMsgId({
        messageId,
        channelId
      });
      if (!take) throw new Error("Take not found");

      await ctx.message?.send(texts.user.bannedWithReason(take.id), {
        chat_id: tgid
      });

      await ctx.message?.send(texts.admin.ban);

      logCbQuery("ban", ctx);
    } catch (err) {
      logger.error(`Failed to ban user: ${err}`);
      throw err;
    }
  }

}

export const adminTakesHandler = new AdminTakesHandler();
