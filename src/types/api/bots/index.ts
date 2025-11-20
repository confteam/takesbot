import { BotType } from "../../enums";

export interface AuthBotDto {
  tgid: number;
  type: BotType;
}
