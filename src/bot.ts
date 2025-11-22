import { Telegram } from "puregram";
import { config } from "./config";
import { HearManager } from "@puregram/hear";
import { authBotHelper } from "./utils/authBot";
import { logger } from "./utils/logger";
import { initMiddlewares } from "./middlewares";
import { registerHandlers } from "./handlers";
import { session } from "@puregram/session";
import { INITIAL_SESSION } from "./types/session";

async function bootstrap() {
  try {
    const telegram = new Telegram({
      token: config.token,
      mergeMediaEvents: true
    });

    logger.info("Initialized bot");

    initMiddlewares(telegram);

    telegram.updates.use(session({
      initial: () => (INITIAL_SESSION)
    }));

    const hearManager = new HearManager();
    telegram.updates.on("message", hearManager.middleware);

    logger.info("Registered middlewares");

    registerHandlers(hearManager, telegram);
    logger.info("Registered handlers");

    // start polling
    telegram.updates.startPolling()
      .then(async () => {
        logger.info(`Started polling @${telegram.bot.username}`);
        const bot = await authBotHelper(telegram);
        logger.info({
          id: bot.id,
          tgid: bot.tgid,
          type: bot.type,
          channel: bot.channel,
        }, "Authenticated bot");
      })
      .catch(logger.error);
  } catch (err) {
    logger.error(`Error while starting bot: ${err}`);
  }
}

bootstrap();
