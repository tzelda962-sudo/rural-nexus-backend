import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function campaignPublished(params: {
  campaignId: string;
  slug: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "campaign.CampaignPublished",
    aggregateId: params.campaignId,
    payload: { ...params },
  });
}
