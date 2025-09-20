export enum BotType {
  TAKES = "TAKES",
  MP = "MP",
  MOD = "MOD",
}

export enum Step {
  START = "start",
  CHOOSE_ANONIMITY = "choose_anonimity",
  WRITING = "writing"
}

export enum UserRole {
  MEMBER = "MEMBER",
  BANNED = "BANNED",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN"
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
