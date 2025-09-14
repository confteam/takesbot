import { UserRole } from "../../types/enums/userRole";

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
}
