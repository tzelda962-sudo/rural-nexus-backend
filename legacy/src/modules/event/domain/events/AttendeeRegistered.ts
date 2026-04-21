import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function attendeeRegistered(params: {
  eventId: string;
  userId: string;
  registrationId: string;
  eventTitle: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "event.AttendeeRegistered",
    aggregateId: params.eventId,
    payload: { ...params },
  });
}
