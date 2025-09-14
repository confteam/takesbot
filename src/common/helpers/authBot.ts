import { Telegram } from "puregram";
import { authBot } from "../api/bot/requests";
import { Bot } from "../types/bot";
import { channelStore } from "../stores/channel.store";
import { BotType } from "../types/enums/botType";
import { logger } from "../logger/logger";
import { nanoid } from "nanoid";
import { botStore } from "../stores/bot.store";

export async function authBotHelper(telegram: Telegram): Promise<Bot> {
  try {
    const { bot } = await authBot({ tgid: telegram.bot.id.toString(), type: BotType.TAKES });

    botStore.set({ id: bot.id, tgid: bot.tgid, type: bot.type });

    if (!bot.channel) {
      channelStore.update({ code: nanoid(6) });
    } else {
      channelStore.set(bot.channel);
    }

    return bot;
  } catch (err) {
    logger.error(`Failed to authorize bot: ${err}`);
    throw err;
  }
}
