import { Bot } from "./bot";
import { BotType } from "./enums";
import { UserRole } from "./enums";
import { Channel } from "./channel";

export interface AuthBotDto {
  tgid: string;
  type: BotType;
}

export interface AuthBotResponse {
  bot: Bot;
}

export interface UpsertUserDto {
  tgid: string;
  chatId: string;
  channelId: number;
  role: UserRole;
}

export interface UpdateUserDto {
  tgid: string;
  chatId: string;
  role: UserRole;
  anonimity: boolean;
}

export interface CreateTakeDto {
  userTgId: string;
  messageId: string;
  channelId: number;
}

export interface UpdateTakeStatusDto {
  messageId: string;
  status: string;
}

export interface ChannelChats {
  adminChatId?: string;
  channelId?: string;
  discussionId?: string;
}

export interface UpdateChannelDto extends ChannelChats {
  id: number;
}

export interface CreateChannelDto extends ChannelChats {
  botTgId: string;
  botType: BotType;
  code?: string;
}

export interface CreateChannelResponse {
  channel: Channel;
}

export interface GetTakesAuthorDto {
  messageId: string;
  channelId: number;
}

export interface GetTakesAuthorResponse {
  chatId: string;
}

export interface GetUsersAnonimityDto {
  channelId: number;
  tgid: string;
}

export interface GetUsersAnonimityResponse {
  anonimity: boolean;
}

export interface ToggleUsersAnonimityDto extends GetUsersAnonimityDto { }

export interface ToggleUsersAnonimityResponse extends GetUsersAnonimityResponse { }
