import { Telegram } from "puregram";
import { config } from "./common/config/config";
import { HearManager } from "@puregram/hear";
import { registerTakesModule } from "./modules/takes";
import { session } from "@puregram/session";
import { INITIAL_SESSION } from "./common/types/session";
import { authBotHelper } from "./common/helpers/authBot";
import { logger } from "./common/logger/logger";
import { registerChatsModule } from "./modules/chats";
import { upsertUserMW } from "./common/middlewares/upsertUser.middleware";

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
    telegram.updates.use((ctx, next) => upsertUserMW(ctx, next));

    // some "on" stuff
    telegram.updates.on("message", hearManager.middleware);

    // register modules
    registerChatsModule(telegram);
    registerTakesModule(hearManager, telegram);
    logger.info("Registered modules");

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
