import { Bot } from "../../types/bot";
import { BotType } from "../../types/enums/botType";

export interface AuthBotDto {
  tgid: string;
  type: BotType;
}

export interface AuthBotResponse {
  bot: Bot;
}
