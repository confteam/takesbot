import { InlineKeyboard } from "puregram";
import { AnonimityPayload, TakeStatus } from "./takes.types";

export const anonimityKeyboard = InlineKeyboard.keyboard([
  [
    InlineKeyboard.textButton({
      text: "Анонимно",
      payload: AnonimityPayload.ANON,
    }),
    InlineKeyboard.textButton({
      text: "Неанонимно",
      payload: AnonimityPayload.NOTANON,
    })
  ]
]);

export const takeKeyboard = InlineKeyboard.keyboard([
  [
    InlineKeyboard.textButton({
      text: "✅",
      payload: TakeStatus.ACCEPTED
    }),
    InlineKeyboard.textButton({
      text: "❌",
      payload: TakeStatus.REJECTED
    })
  ]
])
