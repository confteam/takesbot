import { Channel } from "./channel";
import { BotType } from "./enums";

export type Bot = {
  id: number;
  tgid: number;
  type: BotType;
  channel: Channel | null;
}

export type BotWithoutChannel = Omit<Bot, "channel">;
