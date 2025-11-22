import { TakeStatus } from "../../enums";

export interface TakeIdDto {
  id: number;
  channelId: number;
}

export interface TakeMsgIdDto {
  messageId: number;
  channelId: number;
}

export interface CreateTakeDto {
  adminMessageId: number;
  userMessageId: number;
  channelId: number;
  userTgId: number;
}

export interface UpdateTakeStatusDto {
  status: TakeStatus | string;
}

export interface GetTakeAuthorResponse {
  tgid: number;
}
