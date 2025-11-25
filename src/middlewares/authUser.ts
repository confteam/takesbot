import { Context, Middleware, NextMiddleware } from "puregram";
import { logger } from "../utils/logger";
import { usersApi } from "../services/api/users";
import { MyContext } from "../types/context";

export const authUser: Middleware<Context> = async (ctx: Context, next: NextMiddleware) => {
  try {
    const message = ctx.update?.message ?? ctx.update?.callback_query;
    const myCtx = ctx as MyContext<Context>;
    const chatType = ctx.update?.message?.chat.type;
    const channelId = myCtx.session.channelId;
    if (!message || !channelId || chatType !== "private") {
      await next();
      return;
    }
    if (!message.from) throw new Error("ctx.from is null");

    const tgid = message.from.id;

    const role = await usersApi.getUserRole({ tgid, channelId });
    if (!role) {
      await create(tgid, channelId);
    }

    await next();
  } catch (err) {
    logger.error(`Failed to upsert user: ${err}`);
    throw err;
  }
}

async function create(tgid: number, channelId: number) {
  try {
    await usersApi.upsert({
      tgid,
      channelId: channelId,
    });

    logger.info({ tgid }, `Registered user`)
  } catch (err) {
    throw err;
  }
}
