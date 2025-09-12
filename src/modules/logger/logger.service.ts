import { CallbackQueryContext, MessageContext } from "puregram";
import { logger } from "../../common/logger/logger";

export class LoggerService {
  private readonly logger = logger;

  command(name: string, ctx: MessageContext) {
    const userId = ctx.from?.id;
    const username = ctx.from?.username;

    this.logger.info(`Command "${name}" invoked by user ${userId} - @${username}`);
  }

  cbQuery(name: string, ctx: CallbackQueryContext) {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    const data = ctx.data;

    this.logger.info({ data }, `Callback query "${name}" invoked by user ${userId} - @${username}`);
  }
}
