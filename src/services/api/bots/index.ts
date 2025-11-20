import axios from "axios";
import { AuthBotDto } from "../../../types/api/bots";
import { Bot } from "../../../types/bot";
import { config } from "../../../config";

class BotsApi {
  private readonly url = `${config.api_url}/bots`;

  async auth(body: AuthBotDto): Promise<Bot> {
    try {
      const response = await axios.post<Bot>(this.url, body);
      return response.data;
    } catch (err: any) {
      if (err.response.data.error) {
        throw new Error(err.response.data.error);
      }

      throw new Error("Network error")
    }
  }
}

export const botsApi = new BotsApi();
