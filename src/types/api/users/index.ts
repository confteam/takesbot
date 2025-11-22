import { UserRole } from "../../enums";

export interface UserChannelDto {
  tgid: number;
  channelId: number;
}

export interface UpsertUserDto extends UserChannelDto {
  role: UserRole;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}
