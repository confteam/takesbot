import { InputMedia, MediaSource, MessageContext, NextMiddleware } from "puregram";
import { logCommand } from "../utils/logs";
import { channelStore } from "../services/stores/channel";
import { texts } from "../texts";
import { standartKeyboard, takeKeyboard } from "../keyboards";
import { logger } from "../utils/logger";
import { TakeSendParams } from "../types/params";
import { mediaGroupsStore } from "../services/stores/mediaGroups";
import { usersApi } from "../services/api/users";
import { createTake, prepareText } from "../utils/userHandler";
import { UserRole } from "../types/enums";
import { replysApi } from "../services/api/replys";

class UserHandler {
  async start(ctx: MessageContext) {
    logCommand("start", ctx);
    const channel = channelStore.get();

    if (!channel.adminChatId || !channel.channelChatId) {
      await ctx.send(texts.bot.notAdded(channel.code));
      return;
    }

    const role = await usersApi.getUserRole({
      channelId: channel.id,
      tgid: ctx.from!.id.toString()
    });

    await ctx.send(texts.bot.start, {
      reply_markup: standartKeyboard(role === UserRole.ADMIN || role === UserRole.SUPERADMIN)
    });
  }

  async takeMessage(ctx: MessageContext, next: NextMiddleware) {
    try {
      const channel = channelStore.get();

      // если админ чата нет отправляем сообщение что его нет
      if (channel.adminChatId === "") {
        await ctx.send(texts.bot.notAdded(channel.code));
        return;
      }


      // получаем анонимность пользователя
      const anonimity = await usersApi.getUserAnonimity({
        tgid: ctx.from!.id.toString(),
        channelId: channel.id
      });

      const { finalText, baseText, author } = prepareText(ctx, anonimity);

      // параметры
      const params: TakeSendParams = {
        ctx,
        anonimity,
        finalText, // какой текст должен быть в админ чате
        baseText, // исходный текст
        author,
        adminChatId: channel.adminChatId,
      }

      // айди тейка в лс
      const userMessageId = ctx.id.toString();
      // получаем айди тейка в админ чате
      let adminMessageId = "";

      if (ctx.isMediaGroup()) {
        adminMessageId = await this.takeMediaGroup(params);
      } else if (ctx.hasAttachmentType("photo")) {
        adminMessageId = await this.takePhoto(params);
      } else if (ctx.hasAttachmentType("video")) {
        adminMessageId = await this.takeVideo(params);
      } else if (ctx.hasText()) {
        adminMessageId = await this.takeText(params);
      } else {
        await ctx.send(texts.errors.unsupportedTake);
      }

      // создаем тейк в бд
      const id = await createTake({
        userTgId: ctx.from!.id.toString(),
        userMessageId,
        adminMessageId,
        channelId: channel.id
      });

      // отправляем сообщение что тейк отправлен
      await ctx.send(texts.take.sent(id));

      await next();
    } catch (err) {
      logger.error(`Failed to handle take: ${err}`);
      throw err;
    }
  }

  private async takeMediaGroup({ ctx, baseText, author, adminChatId, anonimity }: TakeSendParams): Promise<string> {
    try {
      const inputMedias = ctx.mediaGroup!.attachments.map((att, index) => {
        if (att!.is("photo")) {
          return InputMedia.photo(MediaSource.fileId(att.bigSize.fileId), {
            caption: index === 0 ? baseText : "",
          });
        }
        if (att?.is("video")) {
          return InputMedia.video(MediaSource.fileId(att.fileId), {
            caption: index === 0 ? baseText : "",
          });
        }
        return null;
      }).filter(Boolean);

      const messages = await ctx.sendMediaGroup(inputMedias as any, {
        chat_id: adminChatId,
      });

      const mgMsgId = messages[0]!.id;

      mediaGroupsStore.pushToMessages({
        inputMedias,
        id: mgMsgId.toString()
      });

      const message = await ctx.send(anonimity ? "." : author, {
        chat_id: adminChatId,
        reply_parameters: {
          message_id: mgMsgId
        },
        reply_markup: takeKeyboard
      })

      return message.id.toString();
    } catch (err) {
      logger.error(`Failed to send media group: ${err}`);
      throw err;
    }
  }

  private async takePhoto({ ctx, finalText, adminChatId }: TakeSendParams): Promise<string> {
    try {
      const message = await ctx.sendPhoto(MediaSource.fileId(ctx!.photo![0]!.fileId), {
        chat_id: adminChatId,
        caption: finalText,
        reply_markup: takeKeyboard
      });

      return message.id.toString();
    } catch (err) {
      logger.error(`Failed to send photo: ${err}`);
      throw err;
    }
  }

  private async takeVideo({ ctx, finalText, adminChatId }: TakeSendParams): Promise<string> {
    try {
      const message = await ctx.sendVideo(MediaSource.fileId(ctx!.video!.fileId), {
        chat_id: adminChatId,
        caption: finalText,
        reply_markup: takeKeyboard
      });

      return message.id.toString();
    } catch (err) {
      logger.error(`Failed to send video: ${err}`);
      throw err;
    }
  }

  private async takeText({ ctx, finalText, adminChatId }: TakeSendParams): Promise<string> {
    try {
      const message = await ctx.send(finalText, {
        chat_id: adminChatId,
        reply_markup: takeKeyboard
      });

      return message.id.toString();
    } catch (err) {
      logger.error(`Failed to send text: ${err}`);
      throw err;
    }
  }

  async reply(ctx: MessageContext) {
    try {
      const replyMessageId = ctx.replyToMessage!.id.toString();
      const userMessageId = ctx.id.toString();

      const reply = await replysApi.getByMsgId(replyMessageId);
      if (!reply) return;

      const newReply = await ctx.send(texts.admin.reply(ctx.text!), {
        chat_id: channelStore.get().adminChatId,
        reply_parameters: {
          message_id: Number(reply.adminMessageId)
        }
      });

      const createdReply = await replysApi.create({
        takeId: reply.takeId,
        userMessageId: userMessageId,
        adminMessageId: newReply.id.toString()
      });

      logger.info(createdReply, "Sent reply");
      await ctx.send(texts.user.sentReply);
    } catch (err) {
      logger.error(`Failed to reply: ${err}`);
    }
  }
}

export const userHandler = new UserHandler();
