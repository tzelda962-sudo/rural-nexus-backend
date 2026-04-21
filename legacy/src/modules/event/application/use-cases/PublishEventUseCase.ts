import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  PublishEvent,
  PublishEventInput,
} from "../../domain/ports/inbound/PublishEvent";
import { EventRepository } from "../../domain/ports/outbound/EventRepository";
import { EventBus } from "../../../../shared/domain/events/EventBus";

export class PublishEventUseCase implements PublishEvent {
  constructor(
    private readonly events: EventRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: PublishEventInput): Promise<void> {
    const event = await this.events.findById(
      UniqueId.fromString(input.eventId),
    );
    if (!event) throw new NotFoundError("Event", input.eventId);

    event.publish();
    await this.events.save(event);
    await this.eventBus.publishAll(event.pullEvents());
  }
}
