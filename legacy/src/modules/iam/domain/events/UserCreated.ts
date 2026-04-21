import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function userCreated(params: {
  userId: string;
  email: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "iam.UserCreated",
    aggregateId: params.userId,
    payload: { userId: params.userId, email: params.email },
  });
}
