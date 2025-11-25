import { UserRole } from "../../types/enums";
import { UserWithoutId } from "../../types/user";

class UsersStore {
  private users: UserWithoutId[] = [];

  set = (users: UserWithoutId[]) => {
    this.users = users;
  }

  add = (user: UserWithoutId) => {
    this.users = [...this.users, user];
  }

  find = (tgid: number) => {
    return this.users.find((user) => user.tgid === tgid);
  }

  updateRole = (tgid: number, role: UserRole) => {
    this.users = this.users.map((user) =>
      user.tgid === tgid ? { ...user, role } : user
    );
  }
}

export const usersStore = new UsersStore();
