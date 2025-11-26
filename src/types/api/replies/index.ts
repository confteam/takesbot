export interface ReplyChannelIdDto {
  channelId: number;
  messageId: number;
}

export interface ReplyTakeIdDto {
  takeId: number;
  messageId: number;
}

export interface CreateReplyDto {
  takeId: number;
  channelId: number;
  userMessageId: number;
  adminMessageId: number;
}
