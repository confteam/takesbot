import { Bot } from "../types/bot";

class BotStore {
  private bot: Bot | null = null;

  set(bot: Bot) {
    this.bot = bot;
  }

  update(partial: Partial<Bot>) {
    if (!this.bot) return;
    this.bot = { ...this.bot, ...partial };
  }

  get(): Bot | null {
    return this.bot;
  }
}

export const botStore = new BotStore();
