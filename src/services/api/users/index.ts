import axios from "axios";
import { config } from "../../../config";
import { UpdateUserRoleDto, UpsertUserDto, UserChannelDto } from "../../../types/api/users";
import { UserRole } from "../../../types/enums";
import { logger } from "../../../utils/logger";

class UsersApi {
  private readonly url = `${config.api_url}/users`;
  private readonly paramsUrl = (param: number, path?: string) => `${this.url}${path ? "/" + path : ""}/${param}`;
  private readonly queryUrl = ({ channelId, tgid }: UserChannelDto, path?: string) =>
    `${this.url}/${path ?? ""}?channelId=${channelId}&tgId=${tgid}`;

  async upsert(body: UpsertUserDto) {
    try {
      logger.info(body, "sent request")
      await axios.post(`${this.paramsUrl(body.tgid)}`, body);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to upsert user");
    }
  }

  /*async getUserAnonimity(query: UserChannelDto): Promise<boolean> {
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
  }*/

  async getUserRole(query: UserChannelDto): Promise<UserRole> {
    try {
      logger.info(query, "sent request")
      const response = await axios.get(`${this.queryUrl(query, "role")}`);
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to get user's role");
    }
  }

  async updateUserRole(query: UserChannelDto, body: UpdateUserRoleDto) {
    try {
      logger.info({ query, body }, "sent request")
      await axios.patch(`${this.queryUrl(query, "role")}`, body);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to update user's role");
    }
  }
}

export const usersApi = new UsersApi();
