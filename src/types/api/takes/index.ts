import { TakeStatus } from "../../enums";

export interface TakeDto {
  messageId: string;
  channelId: number;
}

export interface CreateTakeDto extends TakeDto {
  userTgId: string;
}

export interface UpdateTakeStatusDto {
  status: TakeStatus;
}

export interface GetTakeAuthorResponse {
  userTgId: string;
  chatId: string | null;
}
