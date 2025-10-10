import { Telegram } from "puregram";
import { Bot } from "../types/bot";
import { channelStore } from "../services/stores/channel";
import { BotType } from "../types/enums";
import { logger } from "./logger";
import { nanoid } from "nanoid";
import { botStore } from "../services/stores/bot";
import { botsApi } from "../services/api/bots";

export async function authBotHelper(telegram: Telegram): Promise<Bot> {
  try {
    const bot = await botsApi.auth({ tgid: telegram.bot.id.toString(), type: BotType.TAKES });

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
