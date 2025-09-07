import { Telegram } from "puregram";
import { config } from "./common/config";
import { HearManager } from "@puregram/hear";
import { registerTakesModule } from "./modules/takes";
import { session } from "@puregram/session";
import { INITIAL_SESSION } from "./common/session";

function bootstrap() {
  // initializing a telegram instance
  const telegram = new Telegram({
    token: config.token,
  });

  // some "new" stuff
  const hearManager = new HearManager();

  // some "use" stuff
  telegram.updates.use(session({
    initial: () => (INITIAL_SESSION)
  }));

  // some "on" stuff
  telegram.updates.on("message", hearManager.middleware);

  // register modules
  registerTakesModule(hearManager);

  // start polling
  telegram.updates.startPolling()
    .then(() => console.log(`started polling @${telegram.bot.username}`))
    .catch(console.error);
}

bootstrap();
