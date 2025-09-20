import { Telegram } from "puregram";
import { config } from "./config";
import { HearManager } from "@puregram/hear";
import { session } from "@puregram/session";
import { INITIAL_SESSION } from "./types/session";
import { authBotHelper } from "./utils/authBot";
import { logger } from "./utils/logger";
import { initMiddlewares } from "./middlewares";
import { registerHandlers } from "./handlers";

async function bootstrap() {
  try {
    const telegram = new Telegram({
      token: config.TOKEN,
    });

    logger.info("Initialized bot");

    telegram.updates.use(session({
      initial: () => (INITIAL_SESSION)
    }));

    const hearManager = new HearManager();
    telegram.updates.on("message", hearManager.middleware);

    initMiddlewares(telegram);
    logger.info("Registered middlewares");

    registerHandlers(hearManager, telegram);
    logger.info("Registered handlers");

    // start polling
    telegram.updates.startPolling()
      .then(async () => {
        logger.info(`Started polling @${telegram.bot.username}`);
        const bot = await authBotHelper(telegram);
        logger.info({ bot }, "Authenticated bot");
      })
      .catch(logger.error);
  } catch (err) {
    logger.error(`Error while starting bot: ${err}`);
  }
}

bootstrap();
