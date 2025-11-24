export type Session = {
  state: WaitingFor | null;
  channelId: number;
}

export enum WaitingFor {
  DECORATIONS = "DECORATIONS",
}

export const INITIAL_SESSION: Session = {
  state: null,
  channelId: 0,
}
