import { InlineKeyboard } from "puregram";
import { AnonimityPayload } from "./takes.payloads";

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
