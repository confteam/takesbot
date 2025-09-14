import { Context, Middleware, NextMiddleware } from "puregram";
import { channelStore } from "../stores/channel.store";
import { logger } from "../logger/logger";
import { updateUser, upsertUser } from "../api/user/requests";
import { UserRole } from "../types/enums/userRole";
import { usersStore } from "../stores/users.store";
import { User } from "../types/user";

export const upsertUserMW: Middleware<Context> = async (ctx: Context, next: NextMiddleware) => {
  try {
    const channel = channelStore.get();

    const message = ctx.update?.message ?? ctx.update?.callback_query;
    if (!message || !channel.id) {
      await next();
      return;
    }
    if (!message.from) throw new Error("ctx.from is null");

    let userRole = UserRole.MEMBER;
    let tgid = message.from.id.toString();
    let chatId = message?.chat?.id != null || undefined ? String(message.chat.id) : "";

    const user = usersStore.find(tgid);
    if (!user) {
      await create(tgid, chatId, channel.id, userRole);
    } else if (!user.chatId) {
      await update({ tgid, chatId });
    }

    await next();
  } catch (err) {
    logger.error(`Failed to upsert user: ${err}`);
    throw err;
  }
}

async function create(tgid: string, chatId: string, channelId: number, role: UserRole) {
  try {
    await upsertUser({
      tgid,
      chatId,
      channelId: channelId,
      role: role
    });

    logger.info({ tgid, chatId }, `Registered user`)

    usersStore.add({ tgid, chatId });
  } catch (err) {
    throw err;
  }
}

async function update(user: User) {
  try {
    await updateUser({
      tgid: user.tgid,
      chatId: user.chatId
    });

    logger.info({ tgid: user.tgid, chatId: user.chatId }, `Updated user`);

    usersStore.update(user);
  } catch (err) {
    throw err;
  }
}
