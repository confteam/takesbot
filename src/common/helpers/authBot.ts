import { Telegram } from "puregram";
import { botStore } from "../stores/bot.store";
import { auth } from "../api/auth/requests";
import { Bot } from "../types/bot";

export async function authBot(telegram: Telegram): Promise<Bot> {
  try {
    const { update } = botStore;
    const bot = botStore.get();

    const updatedBot = await auth({ tgid: telegram.bot.id.toString(), type: bot.type });
    update(updatedBot.bot);

    return bot;
  } catch (err) {
    throw err;
  }
}
