import { TakeStatus } from "./enums";

export type Take = {
  id: number;
  status: TakeStatus;
  userMessageId: string;
  adminMessageId: string;
  channelId: number;
}
