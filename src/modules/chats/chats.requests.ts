import axios from "axios";
import { CreateChannelDto, UpdateChannelDto } from "./chats.types";
import { config } from "../../common/config/config";

export async function updateChannel(body: UpdateChannelDto) {
  try {
    const response = await axios.put(`${config.botsInfoServiceUrl}/channels`, body);
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function createChannel(body: CreateChannelDto) {
  try {
    const response = await axios.post(`${config.botsInfoServiceUrl}/channels`, body);
    return response.data;
  } catch (err) {
    throw err;
  }
}
