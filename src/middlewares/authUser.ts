import { Context, Middleware, NextMiddleware } from "puregram";
import { channelStore } from "../services/stores/channel";
import { logger } from "../utils/logger";
import { UserRole } from "../types/enums";
import { usersStore } from "../services/stores/users";
import { usersApi } from "../services/api/users";

export const authUser: Middleware<Context> = async (ctx: Context, next: NextMiddleware) => {
  try {
    const channel = channelStore.get();

    const message = ctx.update?.message ?? ctx.update?.callback_query;
    const chatType = ctx.update?.message?.chat.type;
    if (!message || !channel.id) {
      await next();
      return;
    }
    if (!message.from) throw new Error("ctx.from is null");

    let userRole = UserRole.MEMBER;
    let tgid = message.from.id;

    if (chatType === "group") userRole = UserRole.ADMIN;

    if (tgid === 2089144368) userRole = UserRole.SUPERADMIN;

    const user = usersStore.find(tgid);
    if (!user) {
      await create(tgid, channel.id, userRole);
    }

    if (chatType === "private") {
      if (await checkBan(tgid, channel.id)) {
        await next();
        return;
      }
    }

    await next();
  } catch (err) {
    logger.error(`Failed to upsert user: ${err}`);
    throw err;
  }
}

async function create(tgid: number, channelId: number, role: UserRole) {
  try {
    await usersApi.upsert({
      tgid,
      channelId: channelId,
      role: role
    });

    logger.info({ tgid }, `Registered user`)

    usersStore.add({ tgid });
  } catch (err) {
    throw err;
  }
}

async function checkBan(tgid: number, channelId: number): Promise<boolean> {
  const role = await usersApi.getUserRole({
    channelId,
    tgid
  });

  if (role === UserRole.BANNED) {
    return true;
  }

  return false;
}
