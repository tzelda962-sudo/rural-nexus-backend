import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function eventPublished(params: {
  eventId: string;
  title: string;
  slug: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "event.EventPublished",
    aggregateId: params.eventId,
    payload: { ...params },
  });
}
