import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  CancelRegistration,
  CancelRegistrationInput,
} from "../../domain/ports/inbound/CancelRegistration";
import { EventRepository } from "../../domain/ports/outbound/EventRepository";
import { EventRegistrationRepository } from "../../domain/ports/outbound/EventRegistrationRepository";

export class CancelRegistrationUseCase implements CancelRegistration {
  constructor(
    private readonly events: EventRepository,
    private readonly registrations: EventRegistrationRepository,
  ) {}

  async execute(input: CancelRegistrationInput): Promise<void> {
    const eventId = UniqueId.fromString(input.eventId);
    const userId = UniqueId.fromString(input.userId);

    const event = await this.events.findById(eventId);
    if (!event) throw new NotFoundError("Event", input.eventId);

    const registration = await this.registrations.findActiveByEventAndUser(
      eventId,
      userId,
    );
    if (!registration) {
      throw new NotFoundError("Registration");
    }

    registration.cancel();
    event.decrementRegistration();

    await this.registrations.save(registration);
    await this.events.save(event);
  }
}
