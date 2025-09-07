import { ResponseWithInlineKeyboard } from "../../common/responses";
import { anonOrNotKeyboard } from "./takes.keyboards";
import { startText } from "./takes.texts";

export class TakesService {
  startMessage(): ResponseWithInlineKeyboard {
    return {
      text: startText,
      reply_markup: anonOrNotKeyboard
    }
  }
}
