/*model Take {
  id            Int         @id @default(autoincrement())
  status        TakeStatus  @default(PENDING)
  messageId     String
  userChannel   UserChannel @relation(fields: [userChannelId], references: [id])
  userChannelId Int
  channel       Channel     @relation(fields: [channelId], references: [id])
  channelId     Int
}
*/

import { TakeStatus } from "./enums";

export type Take = {
  id: number;
  status: TakeStatus;
  messageId: string;
  channelId: string;
}
