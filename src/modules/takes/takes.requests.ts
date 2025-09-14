import axios from "axios";
import { config } from "../../common/config/config";
import { CreateTakeDto } from "./takes.types";

export async function createTake(body: CreateTakeDto) {
  try {
    const response = await axios.post(`${config.botsInfoServiceUrl}/takes`, body);
    return response.data;
  } catch (err) {
    throw err;
  }
}
