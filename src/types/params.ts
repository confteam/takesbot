import { MessageContext } from "puregram";

export interface TakeParams {
  ctx: MessageContext;
  finalText: string;
  adminChatId: string;
  channelId: number;
}
