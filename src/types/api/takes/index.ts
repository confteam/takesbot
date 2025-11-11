import { TakeStatus } from "../../enums";

export interface TakeIdDto {
  id: number;
  channelId: number;
}

export interface TakeMsgIdDto {
  messageId: string;
  channelId: number;
}

export interface CreateTakeDto {
  adminMessageId: string;
  userMessageId: string;
  channelId: number;
  userTgId: string;
}

export interface UpdateTakeStatusDto {
  status: TakeStatus | string;
}

export interface GetTakeAuthorResponse {
  userTgId: string;
  chatId: string;
}
