import { EventType } from "../../value-objects/EventType";
import { Coordinates } from "../../value-objects/EventLocation";

export interface CreateEventInput {
  title: string;
  description: string;
  type: EventType;
  campaignId?: string;
  location: {
    venue: string;
    address: string;
    coordinates?: Coordinates | null;
    isVirtual: boolean;
    virtualLink?: string | null;
  };
  startDate: string;
  endDate: string;
  maxAttendees?: number | null;
  createdBy: string;
}

export interface CreateEventOutput {
  eventId: string;
}

export interface CreateEvent {
  execute(input: CreateEventInput): Promise<CreateEventOutput>;
}
