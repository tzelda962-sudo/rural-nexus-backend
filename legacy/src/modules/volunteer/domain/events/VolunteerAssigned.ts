import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function volunteerAssigned(params: {
  volunteerId: string;
  campaignId: string;
  role: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "volunteer.VolunteerAssigned",
    aggregateId: params.volunteerId,
    payload: { ...params },
  });
}
