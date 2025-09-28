export enum BotType {
  TAKES = "TAKES",
  MP = "MP",
  MOD = "MOD",
}

export enum UserRole {
  MEMBER = "MEMBER",
  BANNED = "BANNED",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN"
}

export enum TakeStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED"
}

export enum SettingsPayload {
  ToggleAnonimity = "TOGGLE_ANONIMITY",
}
