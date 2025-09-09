import axios from "axios";
import { RegisterDto, RegisterResponse } from "./types";
import { config } from "../../config";

export async function register(body: RegisterDto): Promise<RegisterResponse> {
  try {
    const response = await axios.post(`${config.botsInfoServiceUrl}/register`, body);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        throw new Error(
          `failed to register: ${err.response.status} ${JSON.stringify(err.response.data)}`
        );
      } else {
        throw new Error(
          `failed to register: network error (${err.code}) ${err.message}`
        );
      }
    }
    throw err;
  }
}
