import { UserRole } from "../../types/enums/userRole";

export interface UpsertUserDto {
  tgid: string;
  channelId: number;
  role: UserRole;
}
