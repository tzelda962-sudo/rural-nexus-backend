import { MetricAggregateRow, GlobalSummary } from "../outbound/MetricRepository";

export interface GetAggregateMetricsInput {
  campaignIds?: string[];
  types?: string[];
}

export interface GetAggregateMetricsOutput {
  global: GlobalSummary;
  byCampaign: MetricAggregateRow[];
}

export interface GetAggregateMetrics {
  execute(input: GetAggregateMetricsInput): Promise<GetAggregateMetricsOutput>;
}
