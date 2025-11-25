import { UserRole } from "../../enums";

export interface UserChannelDto {
  tgid: number;
  channelId: number;
}

export interface UpsertUserDto extends UserChannelDto {
}

export interface UpdateUserRoleDto {
  role: UserRole;
}
