import axios from "axios";
import { CreateChannelDto, UpdateChannelDto } from "../../../types/api/channels";
import { config } from "../../../config";
import { Channel } from "../../../types/channel";

class ChannelsApi {
  private readonly url = `${config.api_url}/channels`;

  async update(id: number, body: UpdateChannelDto) {
    try {
      await axios.patch(`${this.url}/${id}`, body);
    } catch (err: any) {
      if (err.response.data.error) {
        throw new Error(err.response.data.error);
      }

      throw new Error("Network error")
    }
  }

  async create(body: CreateChannelDto): Promise<Channel> {
    try {
      const response = await axios.post<Channel>(`${this.url}`, body);
      return response.data;
    } catch (err: any) {
      if (err.response.data.error) {
        throw new Error(err.response.data.error);
      }

      throw new Error("Network error")
    }
  }
}

export const channelsApi = new ChannelsApi();
