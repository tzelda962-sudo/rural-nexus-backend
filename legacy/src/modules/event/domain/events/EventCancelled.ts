import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function eventCancelled(params: {
  eventId: string;
  title: string;
  reason: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "event.EventCancelled",
    aggregateId: params.eventId,
    payload: { ...params },
  });
}
