import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  CancelEvent,
  CancelEventInput,
} from "../../domain/ports/inbound/CancelEvent";
import { EventRepository } from "../../domain/ports/outbound/EventRepository";
import { EventBus } from "../../../../shared/domain/events/EventBus";

export class CancelEventUseCase implements CancelEvent {
  constructor(
    private readonly events: EventRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: CancelEventInput): Promise<void> {
    const event = await this.events.findById(
      UniqueId.fromString(input.eventId),
    );
    if (!event) throw new NotFoundError("Event", input.eventId);

    event.cancel(input.reason);
    await this.events.save(event);
    await this.eventBus.publishAll(event.pullEvents());
  }
}
