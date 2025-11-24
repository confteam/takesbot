import axios from "axios";
import { CreateChannelDto, UpdateChannelDto } from "../../../types/api/channels";
import { config } from "../../../config";
import { Channel, ChannelWithoutCode, ChannelWithoutId } from "../../../types/channel";
import { logger } from "../../../utils/logger";

class ChannelsApi {
  private readonly url = `${config.api_url}/channels`;

  async update(id: number, body: UpdateChannelDto) {
    try {
      logger.info(body, "sent request")
      await axios.patch(`${this.url}/${id}`, body);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          throw new Error("channel not found")
        }
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err)
      }

      throw new Error("failed to update channel");
    }
  }

  async create(body: CreateChannelDto): Promise<number> {
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

      throw new Error("failed to create channel");
    }
  }

  async findByCode(code: string): Promise<ChannelWithoutCode | null> {
    try {
      logger.info({ code }, "sent request");
      const response = await axios.get(`${this.url}/${code}`);
      logger.info(response.data, "got response");
      return response.data.channel;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          return null;
        }
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err);
      }

      throw new Error("failed to get channel");
    }
  }

  async findById(id: number): Promise<ChannelWithoutId | null> {
    try {
      logger.info({ id }, "sent request");
      const response = await axios.get(`${this.url}/${id}`);
      logger.info(response.data, "got response");
      return response.data.channel;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          return null;
        }
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err);
      }

      throw new Error("failed to get channel");
    }
  }
}

export const channelsApi = new ChannelsApi();
