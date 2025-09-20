import { Context, CallbackQueryContext } from "puregram";
import { logger } from "./logger";

export function logCommand(name: string, ctx: Context) {
  const userId = ctx.update?.message?.from?.id;
  const username = ctx.update?.message?.from?.username;

  logger.info(`Command "${name}" invoked by user ${userId} - @${username}`);
}

export function logCbQuery(name: string, ctx: CallbackQueryContext) {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const data = ctx.data;

  logger.info({ data }, `Callback query "${name}" invoked by user ${userId} - @${username}`);
}
