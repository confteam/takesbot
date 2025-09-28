import { InputMedia, MediaSource, MessageContext, NextMiddleware, PhotoSize } from "puregram";
import { logCommand } from "../utils/logs";
import { channelStore } from "../services/stores/channel";
import { botNotAdded, startText, takeAuthor, takeSent, unsupportedTake } from "../texts";
import { standartKeyboard, takeKeyboard } from "../keyboards";
import { CreateTakeDto } from "../types/api";
import { logger } from "../utils/logger";
import { api } from "../services/api";
import { TakeParams } from "../types/params";

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

  /*async takeText(ctx: MessageContext, next: NextMiddleware) {
    try {
      const channel = channelStore.get();

      if (channel.adminChatId === "") return { text: botNotAdded(channel.code) };
      if (!ctx.text) return { text: "zalupa idi nahuy" };

      const { anonimity } = await api.getUsersAnonimity({ tgid: ctx.from!.id.toString(), channelId: channel.id });

      let take: CreateTakeDto = {
        userTgId: ctx.from!.id.toString(),
        messageId: "",
        channelId: channel.id,
      };

      const takeText = anonimity ? ctx.text : `${ctx.text}\n\n${takeAuthor(ctx.from?.username || "")}`

      const message = await ctx.send(takeText, {
        chat_id: channel.adminChatId,
        reply_markup: takeKeyboard
      });

      take.messageId = message.id.toString();
      await this.createTake(take);

      await ctx.send(takeSent(take.messageId));

      await next();
    } catch (err) {
      logger.error(`Failed to send take: ${err}`);
      throw err;
    }
  }*/

  async takeMessage(ctx: MessageContext, next: NextMiddleware) {
    try {
      const channel = channelStore.get();

      if (channel.adminChatId === "") {
        await ctx.send(botNotAdded(channel.code));
      }

      const { anonimity } = await api.getUsersAnonimity({
        tgid: ctx.from!.id.toString(),
        channelId: channel.id
      });

      const finalText = this.prepareText(ctx, anonimity);

      const params: TakeParams = {
        ctx,
        finalText,
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

  private async takeMediaGroup({ ctx, finalText, adminChatId, channelId }: TakeParams) {
    try {
      const inputMedias = ctx.mediaGroup!.attachments.map((att, index) => {
        if (att!.is("photo")) {
          return InputMedia.photo(MediaSource.fileId(att.bigSize.fileId), {
            caption: index === 0 ? finalText : "",
          });
        }
        if (att?.is("video")) {
          return InputMedia.video(MediaSource.fileId(att.fileId), {
            caption: index === 0 ? finalText : "",
          });
        }
        return null;
      }).filter(Boolean);

      const messages = await ctx.sendMediaGroup(inputMedias as any, {
        chat_id: adminChatId,
      });

      await this.createTake({
        userTgId: ctx.from!.id.toString(),
        messageId: messages[0]!.id.toString(),
        channelId
      });

      await ctx.send(takeSent(messages[0]!.id.toString()));
    } catch (err) {
      logger.error(`Failed to send media group: ${err}`);
      throw err;
    }
  }

  private async takePhoto({ ctx, finalText, adminChatId, channelId }: TakeParams) {
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

  private async takeVideo({ ctx, finalText, adminChatId, channelId }: TakeParams) {
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

  private async takeText({ ctx, finalText, adminChatId, channelId }: TakeParams) {
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

  private prepareText(ctx: MessageContext, anonimity: boolean): string {
    const baseText = ctx.text ?? ctx.caption ?? "";

    return anonimity ? baseText : `${baseText}\n\n${takeAuthor(ctx.from?.username || "")}`;
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
