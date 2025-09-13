import { MessageContext, NextMiddleware } from "puregram";
import { ChatsService } from "./chats.service";

export class ChatsController {
  private readonly chatsService = new ChatsService();

  async registerChat(ctx: MessageContext, next: NextMiddleware) {
    const message = await this.chatsService.registerChat(ctx);

    if (!message) {
      await next();
      return;
    }

    await ctx.send(message.text, {
      chat_id: message.chatId
    });

    await next();
  }
}
