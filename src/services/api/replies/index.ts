import axios from "axios";
import { config } from "../../../config";
import { CreateReplyDto, ReplyDto } from "../../../types/api/replies";
import { Reply } from "../../../types/reply";
import { logger } from "../../../utils/logger";

class RepliesApi {
  private url = `${config.api_url}/replies`;
  private readonly queryUrl = ({ channelId, messageId }: ReplyDto, path?: string) =>
    `${this.url}/${messageId}${path ? `/${path}` : ""}?channelId=${channelId}`;

  async create(body: CreateReplyDto): Promise<number> {
    try {
      logger.info(body, "sent request")
      const response = await axios.post(this.url, body);
      logger.info(response.data, "got response")
      return response.data.id;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to create reply");
    }
  }

  async getByMsgId(query: ReplyDto): Promise<Reply | null> {
    try {
      logger.info(query, "sent request")
      const response = await axios.get(this.queryUrl(query));
      logger.info(response.data, "got response")
      return response.data.reply;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          return null
        }
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to get reply");
    }
  }
}

export const repliesApi = new RepliesApi();
