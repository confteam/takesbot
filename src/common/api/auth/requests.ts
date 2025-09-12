import axios from "axios";
import { config } from "../../config/config";
import { AuthBotDto, AuthBotResponse } from "./types";

export async function auth(body: AuthBotDto): Promise<AuthBotResponse> {
  try {
    const response = await axios.post(`${config.botsInfoServiceUrl}/bots`, body);
    return response.data;
  } catch (err) {
    throw err;
  }
}
