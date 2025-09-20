import { AuthBotDto, AuthBotResponse, UpsertUserDto, UpdateUserDto, CreateTakeDto, UpdateChannelDto, CreateChannelDto, CreateChannelResponse } from "../types/api";
import axios from "axios";
import { config } from "../config";
import { logger } from "../utils/logger";

class Api {
  async authBot(body: AuthBotDto): Promise<AuthBotResponse> {
    try {
      const response = await axios.post(`${config.API_URL}/bots`, body);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  async upsertUser(dto: UpsertUserDto) {
    try {
      await axios.post(`${config.API_URL}/users`, dto);
    } catch (err) {
      logger.error(`Failed to upsert user: ${err}`);
      throw err;
    }
  }

  async updateUser(dto: Partial<UpdateUserDto>) {
    try {
      await axios.put(`${config.API_URL}/users`, dto);
    } catch (err) {
      logger.error(`Failed to update user: ${err}`);
      throw err;
    }
  }

  async createTake(body: CreateTakeDto) {
    try {
      const response = await axios.post(`${config.API_URL}/takes`, body);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  async updateChannel(body: UpdateChannelDto) {
    try {
      const response = await axios.put(`${config.API_URL}/channels`, body);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  async createChannel(body: CreateChannelDto): Promise<CreateChannelResponse> {
    try {
      const response = await axios.post(`${config.API_URL}/channels`, body);
      return response.data;
    } catch (err) {
      throw err;
    }
  }
}

export const api = new Api();
