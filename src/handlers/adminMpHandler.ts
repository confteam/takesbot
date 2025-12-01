import { CallbackQueryContext } from "puregram";
import { logger } from "../utils/logger";

class AdminMpHandler {
  async handleMp(ctx: CallbackQueryContext) {
    try {

    } catch (err) {
      logger.error(`Failed to handle mp: ${err}`);
    }
  }
}

export const adminMpHandler = new AdminMpHandler();
