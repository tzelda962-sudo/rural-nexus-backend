import { Money } from "../../../../../shared/domain/value-objects/Money";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { ImpactMetric } from "../../entities/ImpactMetric";
import { MetricType } from "../../value-objects/MetricType";

export interface MetricAggregateRow {
  campaignId: string;
  campaignTitle: string;
  metrics: Array<{
    type: MetricType;
    label: string;
    totalValue: number;
    unit: string;
  }>;
}

export interface GlobalSummary {
  totalPeopleServed: number;
  totalFundsRaised: Money;
  totalVolunteerHours: number;
  activeCampaigns: number;
}

export interface MetricRepository {
  save(metric: ImpactMetric): Promise<void>;
  findByCampaign(campaignId: UniqueId): Promise<ImpactMetric[]>;
  aggregate(params: {
    campaignIds?: string[];
    types?: MetricType[];
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<MetricAggregateRow[]>;
  globalSummary(): Promise<GlobalSummary>;
}
