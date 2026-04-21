export interface RegisterAttendeeInput {
  eventId: string;
  userId: string;
}

export interface RegisterAttendeeOutput {
  registrationId: string;
}

export interface RegisterAttendee {
  execute(input: RegisterAttendeeInput): Promise<RegisterAttendeeOutput>;
}
