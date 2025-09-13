import { MessageContext } from "puregram";
import { ChatsService } from "./chats.service";

export class ChatsController {
  private readonly chatsService = new ChatsService();

  async registerChat(ctx: MessageContext) {
    const message = await this.chatsService.registerChat(ctx);

    if (!message) return;

    await ctx.send(message.text, {
      chat_id: message.chatId
    });
  }
}
