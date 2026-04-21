export interface CancelRegistrationInput {
  eventId: string;
  userId: string;
}

export interface CancelRegistration {
  execute(input: CancelRegistrationInput): Promise<void>;
}
