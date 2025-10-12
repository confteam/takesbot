import axios from "axios";
import { config } from "../../../config";
import { CreateTakeDto, GetTakeAuthorResponse, TakeDto, UpdateTakeStatusDto } from "../../../types/api/takes";

class TakesApi {
  private readonly url = `${config.API_URL}/takes`;
  private readonly queryUrl = ({ channelId, messageId }: TakeDto, path?: string) =>
    `${this.url}${path ? `/${path}` : ""}?channelId=${channelId}&messageId=${messageId}`;

  async create(body: CreateTakeDto) {
    try {
      await axios.post(`${this.url}`, body);
    } catch (err) {
      throw err;
    }
  }

  async updateTakeStatus(query: TakeDto, body: UpdateTakeStatusDto) {
    try {
      await axios.patch(`${this.queryUrl(query, "status")}`, body);
    } catch (err) {
      throw err;
    }
  }

  async getTakeAuthor(query: TakeDto): Promise<GetTakeAuthorResponse> {
    try {
      const response = await axios.get(`${this.queryUrl(query, "author")}`);
      return response.data
    } catch (err) {
      throw err;
    }
  }
}

export const takesApi = new TakesApi();
