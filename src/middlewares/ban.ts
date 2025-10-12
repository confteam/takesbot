import { Context, Middleware, NextMiddleware } from "puregram";
import { logger } from "../utils/logger";
import { channelStore } from "../services/stores/channel";
import { UserRole } from "../types/enums";
import { banned } from "../texts";
import { usersApi } from "../services/api/users";

export const banMiddleware: Middleware<Context> = async (ctx: Context, next: NextMiddleware) => {
  try {
    const channel = channelStore.get();
    const message = ctx.update?.message ?? ctx.update?.callback_query;
    const chat = message?.chat;
    if (!message || !channel.id) {
      await next();
      return;
    }

    const role = await usersApi.getUserRole({
      channelId: channel.id,
      tgid: message.from!.id.toString()
    });

    if (role === UserRole.BANNED && ctx.update?.message?.chat.type === "private") {
      if (chat) {
        await ctx.telegram.api.sendMessage({
          text: banned,
          chat_id: message!.chat.id,
        });
      }

      return;
    }

    await next();
  } catch (err) {
    logger.error(`Failed to handle user's role: ${err}`);
    throw err;
  }
}
