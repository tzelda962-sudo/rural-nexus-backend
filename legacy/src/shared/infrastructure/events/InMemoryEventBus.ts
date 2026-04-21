import { Logger } from "pino";
import { DomainEvent } from "../../domain/events/DomainEvent";
import { EventBus, EventHandler } from "../../domain/events/EventBus";

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, EventHandler[]>();

  constructor(private readonly logger?: Logger) {}

  subscribe(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (err) {
        this.logger?.error(
          { err, eventType: event.eventType, eventId: event.eventId },
          "event handler failed",
        );
      }
    }
  }

  async publishAll(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
