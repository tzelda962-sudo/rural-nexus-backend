export interface CancelEventInput {
  eventId: string;
  reason: string;
}

export interface CancelEvent {
  execute(input: CancelEventInput): Promise<void>;
}
