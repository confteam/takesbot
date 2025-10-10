import axios from "axios";
import { config } from "../../../config";
import { UpdateUserDto, UpdateUserRoleDto, UpsertUserDto, UserChannelDto } from "../../../types/api/users";
import { UserRole } from "../../../types/enums";

class UsersApi {
  private readonly url = `${config.API_URL}/users`;
  private readonly paramsUrl = (param: string, path?: string) => `${this.url}${path ? "/" + path : ""}/${param}`;
  private readonly queryUrl = ({ channelId, tgid }: UserChannelDto, path?: string) =>
    `${this.url}/${path ?? ""}?channelId=${channelId}&tgid=${tgid}`;

  async upsert(tgid: string, body: UpsertUserDto) {
    try {
      await axios.post(`${this.paramsUrl(tgid)}`, body);
    } catch (err) {
      throw err;
    }
  }

  async update(tgid: string, body: UpdateUserDto) {
    try {
      await axios.patch(`${this.paramsUrl(tgid)}`, body);
    } catch (err) {
      throw err;
    }
  }

  async getUserAnonimity(query: UserChannelDto): Promise<boolean> {
    try {
      const response = await axios.get(`${this.queryUrl(query, "anonimity")}`);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  async toggleUserAnonimity(query: UserChannelDto): Promise<boolean> {
    try {
      const response = await axios.patch(`${this.queryUrl(query, "anonimity")}`);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  async getUserRole(query: UserChannelDto): Promise<UserRole> {
    try {
      const response = await axios.get(`${this.queryUrl(query, "role")}`);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  async updateUserRole(query: UserChannelDto, body: UpdateUserRoleDto) {
    try {
      await axios.patch(`${this.queryUrl(query, "role")}`, body);
    } catch (err) {
      throw err;
    }
  }
}

export const usersApi = new UsersApi();
