import axios from "axios";
import { config } from "../../../config";
import { CreateReplyDto, ReplyChannelIdDto, ReplyTakeIdDto } from "../../../types/api/replies";
import { Reply } from "../../../types/reply";
import { logger } from "../../../utils/logger";

class RepliesApi {
  private url = `${config.api_url}/replies`;
  private readonly queryChannelIdUrl = ({ channelId, messageId }: ReplyChannelIdDto, path?: string) =>
    `${this.url}/${messageId}${path ? `/${path}` : ""}?channelId=${channelId}`;
  private readonly queryTakeIdUrl = ({ takeId, messageId }: ReplyTakeIdDto, path?: string) =>
    `${this.url}/${messageId}${path ? `/${path}` : ""}?takeId=${takeId}`;

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

  async getByMsgIdAndChannelId(query: ReplyChannelIdDto): Promise<Reply | null> {
    try {
      logger.info(query, "sent request")
      const response = await axios.get(this.queryChannelIdUrl(query));
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

  async getByMsgIdAndTakeId(query: ReplyTakeIdDto): Promise<Reply | null> {
    try {
      logger.info(query, "sent request")
      const response = await axios.get(this.queryTakeIdUrl(query));
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
