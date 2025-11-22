import { TakeStatus } from "./enums";

export type Take = {
  id: number;
  status: TakeStatus;
  userMessageId: number;
  adminMessageId: number;
  channelId: number;
}
