import { Money } from "../../../../../shared/domain/value-objects/Money";
import { Slug } from "../../../../../shared/domain/value-objects/Slug";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Campaign } from "../../../domain/entities/Campaign";
import { ImpactMetric } from "../../../domain/entities/ImpactMetric";
import { CampaignStatus } from "../../../domain/value-objects/CampaignStatus";
import { FundingGoal } from "../../../domain/value-objects/FundingGoal";
import { MetricType } from "../../../domain/value-objects/MetricType";

export interface CampaignRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  funding_goal_cents: string | number;
  currency: string;
  is_flexible_goal: boolean;
  amount_raised_cents: string | number;
  donation_count: string | number;
  status: CampaignStatus;
  start_date: Date;
  end_date: Date | null;
  created_by: string;
  tags: string[];
  is_published: boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export function campaignFromRow(row: CampaignRow): Campaign {
  const currency = row.currency;
  return Campaign.rehydrate(UniqueId.fromString(row.id), {
    title: row.title,
    slug: Slug.create(row.slug),
    description: row.description,
    coverImageUrl: row.cover_image_url,
    fundingGoal: FundingGoal.rehydrate(
      Money.fromCents(Number(row.funding_goal_cents), currency),
      row.is_flexible_goal,
    ),
    amountRaised: Money.fromCents(Number(row.amount_raised_cents), currency),
    donationCount: Number(row.donation_count),
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    createdBy: UniqueId.fromString(row.created_by),
    tags: row.tags ?? [],
    isPublished: row.is_published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export interface ImpactMetricRow {
  id: string;
  campaign_id: string;
  type: MetricType;
  label: string;
  value: string | number;
  unit: string;
  recorded_at: Date;
  recorded_by: string;
}

export function metricFromRow(row: ImpactMetricRow): ImpactMetric {
  return ImpactMetric.rehydrate(UniqueId.fromString(row.id), {
    campaignId: UniqueId.fromString(row.campaign_id),
    type: row.type,
    label: row.label,
    value: Number(row.value),
    unit: row.unit,
    recordedAt: row.recorded_at,
    recordedBy: UniqueId.fromString(row.recorded_by),
  });
}
