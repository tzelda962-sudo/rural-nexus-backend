export interface UpdateCommunicationPreferencesInput {
  userId: string;
  receiveNewsletter?: boolean;
  receiveUpdates?: boolean;
  preferredChannel?: string;
}

export interface UpdateCommunicationPreferences {
  execute(input: UpdateCommunicationPreferencesInput): Promise<void>;
}
