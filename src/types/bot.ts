import { Channel } from "./channel";
import { BotType } from "./enums";

/*model Bot {
  id        Int    @id @default(autoincrement())
  tgid      String
  type      Type
  channel   Channel? @relation(fields: [channelId], references: [id])
  channelId Int?

  @@unique([tgid, type])
}*/

export type Bot = {
  id: number;
  tgid: string;
  type: BotType;
  channel: Channel | null;
  channelId: number;
}

export type BotWithoutChannel = Omit<Bot, "channel" | "channelId">;
