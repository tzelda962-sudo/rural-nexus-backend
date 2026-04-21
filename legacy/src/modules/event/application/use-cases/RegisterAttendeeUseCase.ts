import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import {
  RegisterAttendee,
  RegisterAttendeeInput,
  RegisterAttendeeOutput,
} from "../../domain/ports/inbound/RegisterAttendee";
import { EventRepository } from "../../domain/ports/outbound/EventRepository";
import { EventRegistrationRepository } from "../../domain/ports/outbound/EventRegistrationRepository";

export class RegisterAttendeeUseCase implements RegisterAttendee {
  constructor(
    private readonly events: EventRepository,
    private readonly registrations: EventRegistrationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: RegisterAttendeeInput): Promise<RegisterAttendeeOutput> {
    const eventId = UniqueId.fromString(input.eventId);
    const userId = UniqueId.fromString(input.userId);

    const event = await this.events.findById(eventId);
    if (!event) throw new NotFoundError("Event", input.eventId);

    const existing = await this.registrations.findActiveByEventAndUser(
      eventId,
      userId,
    );
    if (existing) throw new ConflictError("Already registered for this event");

    const registration = event.registerAttendee(userId);

    await this.registrations.save(registration);
    await this.events.save(event);
    await this.eventBus.publishAll(event.pullEvents());

    return { registrationId: registration.id.value };
  }
}
