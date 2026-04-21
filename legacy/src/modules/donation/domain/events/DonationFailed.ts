import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function donationFailed(params: {
  donationId: string;
  reason: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "donation.DonationFailed",
    aggregateId: params.donationId,
    payload: { ...params },
  });
}
