import axios from "axios";
import { UpdateBotDto } from "./type";
import { config } from "../../config/config";

export async function update(body: UpdateBotDto) {
  try {
    const response = await axios.put(`${config.botsInfoServiceUrl}/bots`, body);
    return response.data;
  } catch (err) {
    throw err;
  }
}
