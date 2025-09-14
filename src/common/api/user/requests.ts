import axios from "axios";
import { UpsertUserDto } from "./types";
import { config } from "../../config/config";
import { logger } from "../../logger/logger";

export async function upsertUser(dto: UpsertUserDto) {
  try {
    await axios.post(`${config.botsInfoServiceUrl}/users`, dto);
  } catch (err) {
    logger.error(`Failed to upsert user: ${err}`);
    throw err;
  }
}
