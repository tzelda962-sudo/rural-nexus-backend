export interface PublishEventInput {
  eventId: string;
}

export interface PublishEvent {
  execute(input: PublishEventInput): Promise<void>;
}
