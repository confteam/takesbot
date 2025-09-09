import { BotType } from "./enums/botType";

export interface Bot {
  id: number;
  token: string;
  confession: string;
  chatId: string;
  channelId: string;
  type: BotType;
  code: string;
}
