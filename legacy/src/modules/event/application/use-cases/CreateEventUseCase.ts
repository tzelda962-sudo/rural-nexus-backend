import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { Event } from "../../domain/entities/Event";
import {
  CreateEvent,
  CreateEventInput,
  CreateEventOutput,
} from "../../domain/ports/inbound/CreateEvent";
import { EventRepository } from "../../domain/ports/outbound/EventRepository";
import { EventLocation } from "../../domain/value-objects/EventLocation";

export class CreateEventUseCase implements CreateEvent {
  constructor(private readonly events: EventRepository) {}

  async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    const location = EventLocation.create({
      venue: input.location.venue,
      address: input.location.address,
      coordinates: input.location.coordinates ?? null,
      isVirtual: input.location.isVirtual,
      virtualLink: input.location.virtualLink ?? null,
    });

    const event = Event.create({
      title: input.title,
      description: input.description,
      type: input.type,
      campaignId: input.campaignId
        ? UniqueId.fromString(input.campaignId)
        : undefined,
      location,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      maxAttendees: input.maxAttendees,
      createdBy: UniqueId.fromString(input.createdBy),
    });

    await this.events.save(event);
    return { eventId: event.id.value };
  }
}
