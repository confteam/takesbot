import { Context, Middleware, NextMiddleware } from "puregram";
import { channelStore } from "../stores/channel.store";
import { logger } from "../logger/logger";
import { upsertUser } from "../api/user/requests";
import { UserRole } from "../types/enums/userRole";

export const upsertUserMW: Middleware<Context> = async (ctx: Context, next: NextMiddleware) => {
  try {
    const channel = channelStore.get();

    const message = ctx.update?.message || null;
    if (!message || !channel.id) {
      await next();
      return;
    }

    let userRole = UserRole.MEMBER;
    if (message.chat.id.toString() === channel.adminChatId) userRole = UserRole.ADMIN;

    if (!message.from) throw new Error("ctx.from is null");

    await upsertUser({
      tgid: message.from.id.toString(),
      channelId: channel.id,
      role: userRole
    });

    logger.info({ tgid: message.from.id }, `Registered user`)

    await next();
  } catch (err) {
    logger.error(`Failed to upsert user: ${err}`);
    throw err;
  }
}
