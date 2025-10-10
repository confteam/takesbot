import { UserWithoutId } from "../../types/user";

class UsersStore {
  private users: UserWithoutId[] = [];

  set = (users: UserWithoutId[]) => {
    this.users = users;
  }

  add = (user: UserWithoutId) => {
    this.users = [...this.users, user];
  }

  find = (tgid: string) => {
    return this.users.find((user) => user.tgid === tgid);
  }

  update = (data: UserWithoutId) => {
    const user = this.find(data.tgid);
    if (!user) return;
    user.chatId = data.chatId;
  }
}

export const usersStore = new UsersStore();
