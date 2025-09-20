import { User } from "../../types/user";

class UsersStore {
  private users: User[] = [];

  set = (users: User[]) => {
    this.users = users;
  }

  add = (user: User) => {
    this.users = [...this.users, user];
  }

  find = (tgid: string) => {
    return this.users.find((user) => user.tgid === tgid);
  }

  update = (data: User) => {
    const user = this.find(data.tgid);
    if (!user) return;
    user.chatId = data.chatId;
  }
}

export const usersStore = new UsersStore();
