import axios from "axios";
import { config } from "../../../config";
import { CreateTakeDto, GetTakeAuthorResponse, TakeIdDto, TakeMsgIdDto, UpdateTakeStatusDto } from "../../../types/api/takes";
import { Take } from "../../../types/take";

class TakesApi {
  private readonly url = `${config.API_URL}/takes`;
  private readonly queryUrlId = ({ channelId, id }: TakeIdDto, path?: string) =>
    `${this.url}${path ? `/${path}` : ""}?channelId=${channelId}&id=${id}`;

  private readonly queryUrlMsgId = ({ channelId, messageId }: TakeMsgIdDto, path?: string) =>
    `${this.url}${path ? `/${path}` : ""}?channelId=${channelId}&messageId=${messageId}`;

  async create(body: CreateTakeDto): Promise<number> {
    try {
      const response = await axios.post(`${this.url}`, body);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  async updateTakeStatus(query: TakeIdDto, body: UpdateTakeStatusDto) {
    try {
      await axios.patch(`${this.queryUrlId(query, "status")}`, body);
    } catch (err) {
      throw err;
    }
  }

  async getTakeAuthor(query: TakeIdDto): Promise<GetTakeAuthorResponse> {
    try {
      const response = await axios.get(`${this.queryUrlId(query, "author")}`);
      return response.data
    } catch (err) {
      throw err;
    }
  }

  async getTakeByMsgId(query: TakeMsgIdDto): Promise<Take | null> {
    try {
      const response = await axios.get(`${this.queryUrlMsgId(query)}`);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  async getTakeById(query: TakeIdDto): Promise<Take> {
    try {
      const response = await axios.get(`${this.queryUrlId(query)}`);
      return response.data;
    } catch (err) {
      throw err;
    }
  }
}

export const takesApi = new TakesApi();
