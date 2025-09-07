export type Session = {
  anonymous: boolean | null;
  step: Step | null;
  choiceMessageId: number;
}

export enum Step {
  START = "start",
  CHOOSE_ANONIMITY = "choose_anonimity",
  WRITING = "writing"
}

export const INITIAL_SESSION: Session = {
  anonymous: null,
  step: Step.START,
  choiceMessageId: 0,
}
