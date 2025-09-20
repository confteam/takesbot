import { Step } from "./enums";

export type Session = {
  anonymous: boolean | null;
  step: Step | null;
  choiceMessageId: number;
}

export const INITIAL_SESSION: Session = {
  anonymous: null,
  step: Step.START,
  choiceMessageId: 0,
}
