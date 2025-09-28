import { Channel } from "./channel";
import { BotType } from "./enums";

export interface Bot {
  id: number;
  tgid: string;
  type: BotType;
  channel: Channel | null;
}

export type BotWithoutChannel = Omit<Bot, "channel">;
