import { usersApi } from "../services/api/users";
import { UserRole } from "../types/enums";

export async function checkBan(tgid: number, channelId: number): Promise<boolean> {
  const role = await usersApi.getUserRole({ tgid, channelId });
  if (role === UserRole.BANNED) {
    return true;
  }

  return false;
}
