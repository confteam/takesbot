export interface CreateTakeDto {
  userTgId: string;
  messageId: string;
  channelId: number;
}

export enum AnonimityPayload {
  ANON = "anon",
  NOTANON = "notanon",
}

export enum TakeStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED"
}
