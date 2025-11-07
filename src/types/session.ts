export type Session = {
  state: WaitingFor | null
}

export enum WaitingFor {
  DECORATIONS = "DECORATIONS",
}

export const INITIAL_SESSION: Session = {
  state: null
}
