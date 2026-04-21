import { DomainEvent } from "./DomainEvent";

export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => Promise<void>;

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: readonly DomainEvent[]): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
}
