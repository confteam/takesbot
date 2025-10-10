import axios from "axios";
import { CreateChannelDto, UpdateChannelDto } from "../../../types/api/channels";
import { config } from "../../../config";
import { Channel } from "../../../types/channel";

class ChannelsApi {
  private readonly url = `${config.API_URL}/channels`;

  async update(id: number, body: UpdateChannelDto) {
    try {
      await axios.patch(`${this.url}/${id}`, body);
    } catch (err) {
      throw err;
    }
  }

  async create(body: CreateChannelDto): Promise<Channel> {
    try {
      const response = await axios.post(`${this.url}`, body);
      return response.data;
    } catch (err) {
      throw err;
    }
  }
}

export const channelsApi = new ChannelsApi();
