import { Telegram } from "puregram";
import { config } from "./common/config/config";
import { HearManager } from "@puregram/hear";
import { registerTakesModule } from "./modules/takes";
import { session } from "@puregram/session";
import { INITIAL_SESSION } from "./common/types/session";
import { authBot } from "./common/helpers/authBot";
import { logger } from "./common/logger/logger";

async function bootstrap() {
  try {
    // initializing a telegram instance
    const telegram = new Telegram({
      token: config.token,
    });

    logger.info("Initialized bot");

    // some "new" stuff
    const hearManager = new HearManager();

    // some "use" stuff
    telegram.updates.use(session({
      initial: () => (INITIAL_SESSION)
    }));

    // some "on" stuff
    telegram.updates.on("message", hearManager.middleware);

    // register modules
    registerTakesModule(hearManager, telegram);
    logger.info("Registered modules");

    // start polling
    telegram.updates.startPolling()
      .then(async () => {
        logger.info(`Started polling @${telegram.bot.username}`);
        const bot = await authBot(telegram);
        logger.info({ bot }, "Authenticated bot:");
      })
      .catch(logger.error);
  } catch (err) {
    logger.error(`Error while starting bot: ${err}`);
  }
}

bootstrap();
