import { BotType } from "../../types/enums/botType";

export interface RegisterDto {
  token: string;
  type: BotType;
}

export interface RegisterResponse extends RegisterDto {
  id: number;
  code: string;
}
