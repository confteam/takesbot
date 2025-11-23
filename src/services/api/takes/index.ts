import axios from "axios";
import { config } from "../../../config";
import { CreateTakeDto, GetTakeAuthorResponse, TakeIdDto, TakeMsgIdDto, UpdateTakeStatusDto } from "../../../types/api/takes";
import { Take } from "../../../types/take";
import { logger } from "../../../utils/logger";

class TakesApi {
  private readonly url = `${config.api_url}/takes`;
  private readonly queryUrlId = ({ channelId, id }: TakeIdDto, path?: string) =>
    `${this.url}/${id}${path ? `/${path}` : ""}?channelId=${channelId}`;

  private readonly queryUrlMsgId = ({ channelId, messageId }: TakeMsgIdDto, path?: string) =>
    `${this.url}${path ? `/${path}` : ""}?channelId=${channelId}&messageId=${messageId}`;

  async create(body: CreateTakeDto): Promise<number> {
    try {
      logger.info(body, "sent request")
      const response = await axios.post(`${this.url}`, body);
      logger.info(response.data, "got response")
      return response.data.id;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to create take");
    }
  }

  async updateTakeStatus(query: TakeIdDto, body: UpdateTakeStatusDto) {
    try {
      logger.info({ body, query }, "sent request")
      await axios.patch(`${this.queryUrlId(query, "status")}`, body);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          throw new Error("take not found")
        }
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to update take's status");
    }
  }

  async getTakeAuthor(query: TakeIdDto): Promise<GetTakeAuthorResponse> {
    try {
      logger.info(query, "sent request");
      const response = await axios.get(`${this.queryUrlId(query, "author")}`);
      logger.info(response.data, "got response");
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          throw new Error("take not found")
        }
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to get take's author");
    }
  }

  async getTakeByMsgId(query: TakeMsgIdDto): Promise<Take | null> {
    try {
      logger.info(query, "sent request")
      const response = await axios.get(`${this.queryUrlMsgId(query)}`, {
        validateStatus: (status) => status < 500
      });
      logger.info(response.data, "got response")
      return response.data.take;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          return null;
        }
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to get take by msgId");
    }
  }

  async getTakeById(query: TakeIdDto): Promise<Take | null> {
    try {
      logger.info(query, "sent request")
      const response = await axios.get(`${this.queryUrlId(query)}`);
      logger.info(response.data, "got response")
      return response.data.take;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          return null;
        }
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to get take by id");
    }
  }
}

export const takesApi = new TakesApi();
