import { InlineKeyboard, Keyboard } from "puregram";
import { UserSettingsPayload, TakeStatus, AdminSettingsPayload } from "../types/enums";
import { texts } from "../texts";

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

export const addChannelKeyboard = InlineKeyboard.keyboard([
  [
    InlineKeyboard.textButton({
      text: "Зарегистрировать канал",
      payload: "REGISTER_CHANNEL"
    })
  ]
])

export const standartKeyboard = (isAdmin?: boolean) => Keyboard.keyboard([
  [
    Keyboard.textButton(texts.settings.user.main),
    ...(isAdmin ? [Keyboard.textButton(texts.settings.admin.main)] : [])
  ],
  [
    Keyboard.textButton(texts.settings.user.channelText)
  ],
  [
    ...(isAdmin ? [Keyboard.textButton(texts.user.broadcastText)] : [])
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

export const chooseChannelKeyboard = (channels: { username: string, id: number }[]) => InlineKeyboard.keyboard(
  channels.map(ch => [
    InlineKeyboard.textButton({
      text: `@${ch.username}`,
      payload: `CHANNEL_${ch.id}`
    })
  ])
)
