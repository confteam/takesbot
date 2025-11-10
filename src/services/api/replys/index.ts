import axios from "axios";
import { config } from "../../../config";
import { CreateReplyDto } from "../../../types/api/replys";
import { Reply } from "../../../types/reply";

class ReplysApi {
  private url = `${config.API_URL}/replys`;
  private queryUrl = (messageId: string) => `${this.url}?messageId=${messageId}`;

  async create(body: CreateReplyDto): Promise<number> {
    try {
      const response = await axios.post(this.url, body);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  async getByMsgId(messageId: string): Promise<Reply> {
    try {
      const response = await axios.get(this.queryUrl(messageId));
      return response.data;
    } catch (err) {
      throw err;
    }
  }
}

export const replysApi = new ReplysApi();
