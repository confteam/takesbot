import { InlineKeyboard, Keyboard } from "puregram";
import { SettingsPayload, TakeStatus } from "../types/enums";
import { settingsText } from "../texts";

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
]);

export const settingsKeyboard = (status: boolean) => InlineKeyboard.keyboard([
  [
    InlineKeyboard.textButton({
      text: `Анонимные тейки: ${status ? "✅" : "❌"}`,
      payload: SettingsPayload.ToggleAnonimity
    }),
  ]
]);

export const standartKeyboard = Keyboard.keyboard([
  [
    Keyboard.textButton(settingsText),
  ]
]);
