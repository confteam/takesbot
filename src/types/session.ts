export type Session = {
  state: WaitingFor | null;
  channelId: number;
}

export enum WaitingFor {
  DECORATIONS = "DECORATIONS",
  BROADCAST = "BROADCAST",
  MP = "MP",
}

export const INITIAL_SESSION: Session = {
  state: null,
  channelId: 0,
}
