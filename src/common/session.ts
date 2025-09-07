export type Session = {
  anonymous: boolean | null;
  step: Step;
}

export enum Step {
  START = "start",
  CHOOSE_ANONIMITY = "choose_anonimity",
  WRITING = "writing"
}

export const INITIAL_SESSION: Session = {
  anonymous: null,
  step: Step.START,
}
