import { Entity } from "../../../../shared/domain/Entity";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";

interface EventRegistrationProps {
  eventId: UniqueId;
  userId: UniqueId;
  registeredAt: Date;
  cancelledAt: Date | null;
}

export class EventRegistration extends Entity<EventRegistrationProps> {
  static create(eventId: UniqueId, userId: UniqueId): EventRegistration {
    return new EventRegistration(UniqueId.generate(), {
      eventId,
      userId,
      registeredAt: new Date(),
      cancelledAt: null,
    });
  }

  static rehydrate(
    id: UniqueId,
    props: EventRegistrationProps,
  ): EventRegistration {
    return new EventRegistration(id, props);
  }

  cancel(): void {
    this.props.cancelledAt = new Date();
  }

  get eventId(): UniqueId {
    return this.props.eventId;
  }
  get userId(): UniqueId {
    return this.props.userId;
  }
  get registeredAt(): Date {
    return this.props.registeredAt;
  }
  get cancelledAt(): Date | null {
    return this.props.cancelledAt;
  }
  get isCancelled(): boolean {
    return this.props.cancelledAt !== null;
  }
}
