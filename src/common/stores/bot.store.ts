import { Bot } from "../types/bot";

class BotStore {
  private bot: Bot = {
    id: 0,
    token: "",
    confession: "",
    chatId: "",
    channelId: "",
    type: "",
    code: "",
  };

  set = (bot: Bot) => {
    this.bot = bot;
  }

  update = (partial: Partial<Bot>) => {
    this.bot = { ...this.bot, ...partial };
  }

  get = (): Bot => {
    return this.bot;
  }
}

export const botStore = new BotStore();
