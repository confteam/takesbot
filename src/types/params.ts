import { CallbackQueryContext, MessageContext } from "puregram";

export interface TakeSendParams {
  ctx: MessageContext;
  finalText: string;
  baseText: string;
  author: string;
  anonimity: boolean;
  adminChatId: string;
}

export interface TakeAcceptParams {
  ctx: CallbackQueryContext;
  text: string;
  channelChatId: string;
}
