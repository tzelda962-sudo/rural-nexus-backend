import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function userLoggedIn(params: {
  userId: string;
  ipAddress: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "iam.UserLoggedIn",
    aggregateId: params.userId,
    payload: { userId: params.userId, ipAddress: params.ipAddress },
  });
}
