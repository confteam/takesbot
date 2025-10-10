import { CallbackQueryContext, MessageContext } from "puregram";

export interface TakeSendParams {
  ctx: MessageContext;
  finalText: string;
  baseText: string;
  author: string;
  anonimity: boolean;
  adminChatId: string;
  channelId: number;
}

export interface TakeAcceptParams {
  ctx: CallbackQueryContext;
  text: string;
  channelChatId: string;
}
