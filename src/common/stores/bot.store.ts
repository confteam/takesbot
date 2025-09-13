import { BotWithoutChannel } from "../types/bot";
import { BotType } from "../types/enums/botType";

class BotStore {
  private bot: BotWithoutChannel = {
    id: 0,
    tgid: "",
    type: BotType.TAKES
  }

  set = (bot: BotWithoutChannel) => {
    this.bot = bot;
  }

  update = (partial: Partial<BotWithoutChannel>) => {
    Object.assign(this.bot, partial);
  }

  get = (): BotWithoutChannel => {
    return this.bot;
  }
}

export const botStore = new BotStore();
