import { Bot } from "../types/bot";
import { BotType } from "../types/enums/botType";

class BotStore {
  private bot: Bot = {
    id: 0,
    tgid: 0,
    confession: "",
    chatId: 0,
    channelId: 0,
    type: BotType.TAKES,
    code: "",
  };

  set = (bot: Bot) => {
    this.bot = bot;
  }

  update = (partial: Partial<Bot>) => {
    Object.assign(this.bot, partial);
  }

  get = (): Bot => {
    return this.bot;
  }
}

export const botStore = new BotStore();
