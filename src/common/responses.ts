import { InlineKeyboard } from "puregram";

export interface ResponseWithInlineKeyboard {
  text: string;
  reply_markup: InlineKeyboard;
}
