import axios from "axios";
import { AuthBotDto } from "../../../types/api/bots";
import { Bot } from "../../../types/bot";
import { config } from "../../../config";
import { logger } from "../../../utils/logger";

class BotsApi {
  private readonly url = `${config.api_url}/bots`;

  async auth(body: AuthBotDto): Promise<Bot> {
    try {
      logger.info(body, "sent request")
      const response = await axios.post<Bot>(this.url, body);
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to auth bot");
    }
  }
}

export const botsApi = new BotsApi();
