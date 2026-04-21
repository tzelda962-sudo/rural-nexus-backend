import {
  GlobalSummary,
  MetricAggregateRow,
} from "../../domain/ports/outbound/MetricRepository";

export interface MetricAggregateResponseDto {
  totalPeopleServed: number;
  totalFundsRaisedCents: number;
  totalVolunteerHours: number;
  activeCampaigns: number;
  byCampaign: MetricAggregateRow[];
}

export function toMetricAggregateResponseDto(
  global: GlobalSummary,
  byCampaign: MetricAggregateRow[],
): MetricAggregateResponseDto {
  return {
    totalPeopleServed: global.totalPeopleServed,
    totalFundsRaisedCents: global.totalFundsRaised.amountCents,
    totalVolunteerHours: global.totalVolunteerHours,
    activeCampaigns: global.activeCampaigns,
    byCampaign,
  };
}
