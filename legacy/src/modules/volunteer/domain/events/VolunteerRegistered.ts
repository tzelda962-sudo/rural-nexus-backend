import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function volunteerRegistered(params: {
  volunteerId: string;
  userId: string;
  email: string;
  firstName: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "volunteer.VolunteerRegistered",
    aggregateId: params.volunteerId,
    payload: { ...params },
  });
}
