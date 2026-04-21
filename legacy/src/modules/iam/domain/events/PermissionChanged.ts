import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function permissionChanged(params: {
  userId: string;
  addedRole?: string;
  removedRole?: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "iam.PermissionChanged",
    aggregateId: params.userId,
    payload: { ...params },
  });
}
