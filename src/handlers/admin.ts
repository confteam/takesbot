import { CallbackQueryContext } from "puregram";
import { logger } from "../utils/logger";
import { api } from "../services/api";
import { TakeStatus } from "../types/enums";
import { channelStore } from "../services/stores/channel";
import { takeAccepted, takeRejected } from "../texts";

class AdminHandler {
  async acceptTakeText(ctx: CallbackQueryContext) {
    try {
      const messageId = ctx.message!.id.toString();
      const status = ctx.data;
      const takeText = ctx.message?.text;
      const takeStatusText = status === TakeStatus.ACCEPTED ? "✅Принято." : "❌Отклонено.";

      if (!status) throw new Error("Callback query data is undefined");
      if (!takeText) throw new Error("Take text is undefined");

      await api.updateTakeStatus({ messageId, status });

      await ctx.editText(`${takeText}\n\n${takeStatusText}`);

      if (status === TakeStatus.ACCEPTED) {
        await ctx.message?.send(takeText, {
          chat_id: channelStore.get().channelId,
        });
      }

      const { chatId } = await api.getTakesAuthor({ messageId: messageId, channelId: channelStore.get().id });
      await ctx.message.send((status === TakeStatus.ACCEPTED ? takeAccepted(messageId) : takeRejected(messageId)), {
        chat_id: chatId
      });

      await ctx.answerCallbackQuery({
        text: takeStatusText,
        show_alert: false
      });

      logger.info({ messageId }, "Sent take");
    } catch (err) {
      logger.error(`Failed to accept take: ${err}`);
      throw err;
    }
  }
}

export const adminHandler = new AdminHandler();
