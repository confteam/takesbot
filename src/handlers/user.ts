import { InputMedia, MediaSource, MessageContext, NextMiddleware } from "puregram";
import { logCommand } from "../utils/logs";
import { channelStore } from "../services/stores/channel";
import { botNotAdded, startText, takeAuthor, takeSent, unsupportedTake } from "../texts";
import { standartKeyboard, takeKeyboard } from "../keyboards";
import { CreateTakeDto } from "../types/api";
import { logger } from "../utils/logger";
import { api } from "../services/api";
import { TakeSendParams } from "../types/params";
import { mediaGroupsStore } from "../services/stores/mediaGroups";

class UserHandler {
  async start(ctx: MessageContext) {
    logCommand("start", ctx);
    const channel = channelStore.get();

    if (!channel.adminChatId || !channel.channelId) {
      await ctx.send(botNotAdded(channel.code));
      return;
    }

    await ctx.send(startText, {
      reply_markup: standartKeyboard
    });
  }

  async takeMessage(ctx: MessageContext, next: NextMiddleware) {
    try {
      const channel = channelStore.get();

      if (channel.adminChatId === "") {
        await ctx.send(botNotAdded(channel.code));
        return;
      }

      const { anonimity } = await api.getUsersAnonimity({
        tgid: ctx.from!.id.toString(),
        channelId: channel.id
      });

      const { finalText, baseText, author } = this.prepareText(ctx, anonimity);

      const params: TakeSendParams = {
        ctx,
        anonimity,
        finalText,
        baseText,
        author,
        adminChatId: channel.adminChatId,
        channelId: channel.id
      }

      if (ctx.isMediaGroup()) {
        await this.takeMediaGroup(params);
      } else if (ctx.hasAttachmentType("photo")) {
        await this.takePhoto(params);
      } else if (ctx.hasAttachmentType("video")) {
        await this.takeVideo(params);
      } else if (ctx.hasText()) {
        await this.takeText(params);
      } else {
        await ctx.send(unsupportedTake);
      }

      await next();
    } catch (err) {
      logger.error(`Failed to handle take: ${err}`);
      throw err;
    }
  }

  private async takeMediaGroup({ ctx, baseText, author, adminChatId, channelId, anonimity }: TakeSendParams) {
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

      const msgId = message.id.toString();

      await this.createTake({
        userTgId: ctx.from!.id.toString(),
        messageId: msgId,
        channelId
      });

      await ctx.send(takeSent(msgId));
    } catch (err) {
      logger.error(`Failed to send media group: ${err}`);
      throw err;
    }
  }

  private async takePhoto({ ctx, finalText, adminChatId, channelId }: TakeSendParams) {
    try {
      const message = await ctx.sendPhoto(MediaSource.fileId(ctx!.photo![0]!.fileId), {
        chat_id: adminChatId,
        caption: finalText,
        reply_markup: takeKeyboard
      });

      await this.createTake({
        userTgId: ctx.from!.id.toString(),
        messageId: message.id.toString(),
        channelId
      });

      await ctx.send(takeSent(message.id.toString()));
    } catch (err) {
      logger.error(`Failed to send photo: ${err}`);
      throw err;
    }
  }

  private async takeVideo({ ctx, finalText, adminChatId, channelId }: TakeSendParams) {
    try {
      const message = await ctx.sendVideo(MediaSource.fileId(ctx!.video!.fileId), {
        chat_id: adminChatId,
        caption: finalText,
        reply_markup: takeKeyboard
      });

      await this.createTake({
        userTgId: ctx.from!.id.toString(),
        messageId: message.id.toString(),
        channelId
      });

      await ctx.send(takeSent(message.id.toString()));
    } catch (err) {
      logger.error(`Failed to send video: ${err}`);
      throw err;
    }
  }

  private async takeText({ ctx, finalText, adminChatId, channelId }: TakeSendParams) {
    try {
      const message = await ctx.send(finalText, {
        chat_id: adminChatId,
        reply_markup: takeKeyboard
      });

      await this.createTake({
        userTgId: ctx.from!.id.toString(),
        messageId: message.id.toString(),
        channelId
      });

      await ctx.send(takeSent(message.id.toString()));
    } catch (err) {
      logger.error(`Failed to send text: ${err}`);
      throw err;
    }
  }

  private prepareText(ctx: MessageContext, anonimity: boolean): {
    baseText: string,
    author: string,
    finalText: string,
  } {
    const baseText = ctx.text ?? ctx.caption ?? "";
    const author = takeAuthor(ctx.from?.username || "");

    return {
      finalText: anonimity ? baseText : `${baseText}\n\n${author}`,
      baseText,
      author
    }
  }

  private async createTake(take: CreateTakeDto) {
    try {
      await api.createTake(take);
      logger.info({ take }, "Created take");
    } catch (err) {
      logger.error(`Failed to create take: ${err}`);
      throw err;
    }
  }
}

export const userHandler = new UserHandler();
