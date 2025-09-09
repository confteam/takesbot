import { Telegram } from "puregram";
import { config } from "./common/config";
import { HearManager } from "@puregram/hear";
import { registerTakesModule } from "./modules/takes";
import { session } from "@puregram/session";
import { INITIAL_SESSION } from "./common/types/session";
import { botStore } from "./common/stores/bot.store";
import { register } from "./common/api/register/requests";

async function bootstrap() {
  try {
    // initializing a telegram instance
    const telegram = new Telegram({
      token: config.token,
    });

    // register bot and update bot store
    const { update } = botStore;
    const bot = botStore.get();
    const registeredBot = await register({ token: config.token, type: bot.type });
    update(registeredBot);

    console.log(bot);

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

    // start polling
    telegram.updates.startPolling()
      .then(() => console.log(`started polling @${telegram.bot.username}`))
      .catch(console.error);
  } catch (err) {
    console.error(`error while starting bot: ${err}`);
  }
}

bootstrap();
