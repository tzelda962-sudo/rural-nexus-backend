import { randomUUID } from "node:crypto";

export interface DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly payload: Record<string, unknown>;
}

export function createDomainEvent(params: {
  eventType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}): DomainEvent {
  return {
    eventId: randomUUID(),
    occurredOn: new Date(),
    eventType: params.eventType,
    aggregateId: params.aggregateId,
    payload: params.payload,
  };
}
