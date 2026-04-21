import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function campaignGoalReached(params: {
  campaignId: string;
  title: string;
  goalCents: number;
  raisedCents: number;
  currency: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "campaign.CampaignGoalReached",
    aggregateId: params.campaignId,
    payload: { ...params },
  });
}
