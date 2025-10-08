import { TelegramInputMediaPhoto, TelegramInputMediaVideo } from "puregram/generated";

export interface MGmessages {
  messages: MGmessage[];
}

export interface MGmessage {
  id: string;
  inputMedias: (TelegramInputMediaPhoto | TelegramInputMediaVideo | null)[];
}
