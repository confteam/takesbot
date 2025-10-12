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

class UserHandler {
  async start(ctx: MessageContext) {
    logCommand("start", ctx);
    const channel = channelStore.get();

    if (!channel.adminChatId || !channel.channelChatId) {
      await ctx.send(texts.bot.notAdded(channel.code));
      return;
    }

    await ctx.send(texts.bot.start, {
      reply_markup: standartKeyboard
    });
  }

  async takeMessage(ctx: MessageContext, next: NextMiddleware) {
    try {
      const channel = channelStore.get();

      if (channel.adminChatId === "") {
        await ctx.send(texts.bot.notAdded(channel.code));
        return;
      }

      const anonimity = await usersApi.getUserAnonimity({
        tgid: ctx.from!.id.toString(),
        channelId: channel.id
      });

      const { finalText, baseText, author } = prepareText(ctx, anonimity);

      const params: TakeSendParams = {
        ctx,
        anonimity,
        finalText,
        baseText,
        author,
        adminChatId: channel.adminChatId,
      }

      let msgId = "";

      if (ctx.isMediaGroup()) {
        msgId = await this.takeMediaGroup(params);
      } else if (ctx.hasAttachmentType("photo")) {
        msgId = await this.takePhoto(params);
      } else if (ctx.hasAttachmentType("video")) {
        msgId = await this.takeVideo(params);
      } else if (ctx.hasText()) {
        msgId = await this.takeText(params);
      } else {
        await ctx.send(texts.errors.unsupportedTake);
      }

      await createTake({
        userTgId: ctx.from!.id.toString(),
        messageId: msgId,
        channelId: channel.id
      });

      await ctx.send(texts.take.sent(msgId));

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

}

export const userHandler = new UserHandler();
