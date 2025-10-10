import axios from "axios";
import { AuthBotDto } from "../../../types/api/bots";
import { Bot } from "../../../types/bot";
import { config } from "../../../config";

class BotsApi {
  private readonly url = `${config.API_URL}/bots`;

  async auth(body: AuthBotDto): Promise<Bot> {
    try {
      const response = await axios.post(`${this.url}`, body);
      return response.data;
    } catch (err) {
      throw err;
    }
  }
}

export const botsApi = new BotsApi();
