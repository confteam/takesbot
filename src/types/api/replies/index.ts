export interface ReplyDto {
  channelId: number;
  messageId: number;
}

export interface CreateReplyDto {
  takeId: number;
  channelId: number;
  userMessageId: number;
  adminMessageId: number;
}
