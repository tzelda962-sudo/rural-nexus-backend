import {
  DomainEvent,
  createDomainEvent,
} from "../../../../shared/domain/events/DomainEvent";

export function metricRecorded(params: {
  metricId: string;
  campaignId: string;
  type: string;
  label: string;
  value: number;
  unit: string;
}): DomainEvent {
  return createDomainEvent({
    eventType: "campaign.MetricRecorded",
    aggregateId: params.campaignId,
    payload: { ...params },
  });
}
