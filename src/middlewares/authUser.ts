import { Context, Middleware, NextMiddleware } from "puregram";
import { channelStore } from "../services/stores/channel";
import { logger } from "../utils/logger";
import { api } from "../services/api";
import { UserRole } from "../types/enums";
import { usersStore } from "../services/stores/users";
import { User } from "../types/user";

export const authUser: Middleware<Context> = async (ctx: Context, next: NextMiddleware) => {
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

    if (await checkBan(tgid, channel.id)) {
      await next();
      return;
    }

    if (ctx.update?.message?.chat.type === "group") userRole = UserRole.ADMIN;

    if (tgid === "2089144368") userRole = UserRole.SUPERADMIN;

    const user = usersStore.find(tgid);
    if (!user) {
      await create(tgid, chatId, channel.id, userRole);
    } else if (!user.chatId && ctx.update?.message?.chat.type === "private") {
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
    await api.upsertUser({
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
    await api.updateUser({
      tgid: user.tgid,
      chatId: user.chatId
    });

    logger.info({ tgid: user.tgid, chatId: user.chatId }, `Updated user`);

    usersStore.update(user);
  } catch (err) {
    throw err;
  }
}

async function checkBan(tgid: string, channelId: number): Promise<boolean> {
  const { role } = await api.getUsersRole({
    channelId,
    tgid
  });

  if (role === UserRole.BANNED) {
    return true;
  }

  return false;
}
