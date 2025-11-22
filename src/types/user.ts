export type User = {
  id: number;
  tgid: number;
}

export type UserWithoutId = Omit<User, "id">;
