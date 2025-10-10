import { UserRole } from "../../enums";

interface UserDto {
  chatId: string;
}

export interface UserChannelDto {
  tgid: string;
  channelId: number;
}

export interface UpsertUserDto extends UserDto {
  channelId: number;
  role: UserRole;
}

export interface UpdateUserDto extends UserDto { }

export interface UpdateUserRoleDto {
  role: UserRole;
}
