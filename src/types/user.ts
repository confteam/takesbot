import { UserRole } from "./enums";

export type User = {
  id: number;
  tgid: number;
  role: UserRole;
}

export type UserWithoutId = Omit<User, "id">;
