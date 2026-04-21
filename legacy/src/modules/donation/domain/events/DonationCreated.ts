import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function donationCreated(params: {
  donationId: string;
  donorEmail: string;
  amountCents: number;
  currency: string;
  frequency: string;
  campaignId: string | null;
}): DomainEvent {
  return createDomainEvent({
    eventType: "donation.DonationCreated",
    aggregateId: params.donationId,
    payload: { ...params },
  });
}
