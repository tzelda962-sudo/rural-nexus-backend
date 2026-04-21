import { Campaign } from "../../domain/entities/Campaign";
import { CampaignStatus } from "../../domain/value-objects/CampaignStatus";

export interface CampaignResponseDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  fundingGoalCents: number;
  amountRaisedCents: number;
  currency: string;
  isFlexibleGoal: boolean;
  donationCount: number;
  progressPercentage: number;
  status: CampaignStatus;
  startDate: string;
  endDate: string | null;
  createdBy: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toCampaignResponseDto(
  campaign: Campaign,
): CampaignResponseDto {
  return {
    id: campaign.id.value,
    title: campaign.title,
    slug: campaign.slug.value,
    description: campaign.description,
    coverImageUrl: campaign.coverImageUrl,
    fundingGoalCents: campaign.fundingGoal.target.amountCents,
    amountRaisedCents: campaign.amountRaised.amountCents,
    currency: campaign.fundingGoal.target.currency,
    isFlexibleGoal: campaign.fundingGoal.isFlexible,
    donationCount: campaign.donationCount,
    progressPercentage: campaign.progressPercentage,
    status: campaign.status,
    startDate: campaign.startDate.toISOString(),
    endDate: campaign.endDate?.toISOString() ?? null,
    createdBy: campaign.createdBy.value,
    tags: campaign.tags,
    isPublished: campaign.isPublished,
    publishedAt: campaign.publishedAt?.toISOString() ?? null,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  };
}
