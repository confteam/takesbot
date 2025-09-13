import { MessageContext } from "puregram";
import { botStore } from "../../common/stores/bot.store";
import { logger } from "../../common/logger/logger";
import { onAddToGroup } from "../../common/texts/texts";
import { onAddToChannel } from "../../common/texts/texts";
import { update as updateBot } from "../../common/api/updateInfo/requests";
import { Bot } from "../../common/types/bot";

export class ChatsService {
  async registerChat(ctx: MessageContext) {
    const { get } = botStore;
    const bot = get();

    if (bot.code === ctx.text) {
      const isGroup = ctx.chatType === "group" || "supergroup";
      const isChannel = ctx.chatType === "channel";

      if (isGroup && !bot.chatId) {
        await this.saveAndSync({ chatId: ctx.chat.id.toString() });

        logger.info(`Registered group ${ctx.chat.id}`);
        return {
          text: onAddToGroup,
          chatId: ctx.chatId
        }
      } else if (isChannel && !bot.channelId) {
        await this.saveAndSync({ channelId: ctx.chat.id.toString() });

        if (ctx.chat.username && !bot.confession) {
          await this.saveAndSync({ confession: ctx.chat.username });
        };

        logger.info(`Registered channel ${ctx.chat.id}`);
        if (bot.chatId) {
          return {
            text: onAddToChannel,
            chatId: bot.chatId
          }
        }
      }
    }
  }

  async saveAndSync(data: Partial<Bot>) {
    botStore.update(data);
    await updateBot({ tgid: botStore.get().tgid, ...data });
  }
}
