import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function donationRefunded(params: {
  donationId: string;
  amountCents: number;
  currency: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "donation.DonationRefunded",
    aggregateId: params.donationId,
    payload: { ...params },
  });
}
