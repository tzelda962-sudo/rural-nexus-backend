import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { EventRegistration } from "../../entities/EventRegistration";

export interface EventRegistrationRepository {
  save(registration: EventRegistration): Promise<void>;
  findByEventAndUser(
    eventId: UniqueId,
    userId: UniqueId,
  ): Promise<EventRegistration | null>;
  findActiveByEventAndUser(
    eventId: UniqueId,
    userId: UniqueId,
  ): Promise<EventRegistration | null>;
  countByEvent(eventId: UniqueId): Promise<number>;
}
