import { InlineKeyboard } from "puregram";

export const anonOrNotKeyboard = InlineKeyboard.keyboard([
  [
    InlineKeyboard.textButton({
      text: "Анон",
      payload: "anon",
    }),
    InlineKeyboard.textButton({
      text: "НеАнон",
      payload: "notanon",
    })
  ]
]);
