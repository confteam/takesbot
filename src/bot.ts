import { Telegram } from "puregram";
import { config } from "./config";
import { HearManager } from "@puregram/hear";
import { logger } from "./utils/logger";
import { registerHandlers } from "./handlers";
import { session } from "@puregram/session";
import { INITIAL_SESSION } from "./types/session";
import { initMiddlewares } from "./middlewares";

async function bootstrap() {
  try {
    const telegram = new Telegram({
      token: config.token,
      mergeMediaEvents: true
    });

    logger.info("Initialized bot");

    telegram.updates.use(session({
      initial: () => (INITIAL_SESSION),
    }));

    initMiddlewares(telegram);

    const hearManager = new HearManager();
    telegram.updates.on("message", hearManager.middleware);

    logger.info("Registered middlewares");

    registerHandlers(hearManager, telegram);
    logger.info("Registered handlers");

    // start polling
    telegram.updates.startPolling()
      .then(async () => {
        logger.info(`Started polling @${telegram.bot.username}`);
      })
      .catch(logger.error);
  } catch (err) {
    logger.error(`Error while starting bot: ${err}`);
  }
}

bootstrap();
