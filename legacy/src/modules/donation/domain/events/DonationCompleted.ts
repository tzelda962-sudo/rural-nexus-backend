import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function donationCompleted(params: {
  donationId: string;
  donorEmail: string;
  amountCents: number;
  currency: string;
  campaignId: string | null;
  paymentIntentId: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "donation.DonationCompleted",
    aggregateId: params.donationId,
    payload: { ...params },
  });
}
