import { InlineKeyboard, Keyboard } from "puregram";
import { UserSettingsPayload, TakeStatus, AdminSettingsPayload } from "../types/enums";
import { texts } from "../texts";
import { WaitingFor } from "../types/session";

export const takeKeyboard = InlineKeyboard.keyboard([
  [
    InlineKeyboard.textButton({
      text: "✅",
      payload: TakeStatus.ACCEPTED
    }),
    InlineKeyboard.textButton({
      text: "❌",
      payload: TakeStatus.REJECTED
    }),
    InlineKeyboard.textButton({
      text: "Бан",
      payload: "BAN"
    })
  ]
]);

export const userSettingsKeyboard = (status: boolean) => InlineKeyboard.keyboard([
  [
    InlineKeyboard.textButton({
      text: `Анонимные тейки: ${status ? "✅" : "❌"}`,
      payload: UserSettingsPayload.ToggleAnonimity
    }),
  ]
]);

export const adminSettingsKeyboard = InlineKeyboard.keyboard([
  [
    InlineKeyboard.textButton({
      text: "Декорации",
      payload: AdminSettingsPayload.Decorations
    })
  ]
]);

export const standartKeyboard = (isAdmin?: boolean) => Keyboard.keyboard([
  [
    Keyboard.textButton(texts.settings.user.main),
    ...(isAdmin ? [Keyboard.textButton(texts.settings.admin.main)] : [])
  ]
]);

export const cancelWaitingKeyboard = InlineKeyboard.keyboard([
  [
    InlineKeyboard.textButton({
      text: "Отмена",
      payload: "CANCEL_WAITING_FOR"
    })
  ]
])
