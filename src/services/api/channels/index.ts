import axios from "axios";
import { CreateChannelDto, GetAllUserChannelsResponse, UpdateChannelDto } from "../../../types/api/channels";
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
        } else if (err.response.status === 401) {
          throw new Error("channel with this chat id is already exists")
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

  async findByChatId(chatId: number): Promise<number> {
    try {
      logger.info({ chatId }, "sent request");
      const response = await axios.get(`${this.url}/${chatId}`);
      logger.info(response.data, "got response");
      return response.data.id;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          return 0;
        }
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err);
      }

      throw new Error("failed to get channel");
    }
  }

  async getAllUserChannels(tgid: number): Promise<GetAllUserChannelsResponse[]> {
    try {
      logger.info({ tgid }, "sent request");
      const response = await axios.get(`${this.url}?userTgId=${tgid}`);
      logger.info(response.data, "got response");
      return response.data.channels;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          return [];
        }
        logger.error({ statusCode: err.response.status, data: err.response.data })
      } else {
        logger.error("unespected error", err);
      }

      throw new Error("failed to get channels");
    }
  }
}

export const channelsApi = new ChannelsApi();
