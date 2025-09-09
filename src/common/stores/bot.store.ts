import { Bot } from "../types/bot";
import { BotType } from "../types/enums/botType";

class BotStore {
  private bot: Bot = {
    id: 0,
    token: "",
    confession: "",
    chatId: "",
    channelId: "",
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
