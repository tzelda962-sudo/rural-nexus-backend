import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function campaignCreated(params: {
  campaignId: string;
  title: string;
  slug: string;
  createdBy: string;
  fundingGoalCents: number;
  currency: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "campaign.CampaignCreated",
    aggregateId: params.campaignId,
    payload: { ...params },
  });
}
