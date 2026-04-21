import { PaginatedResult } from "../../../../../shared/application/PaginatedQuery";
import { CampaignStatus } from "../../value-objects/CampaignStatus";

export interface ListPublicCampaignsInput {
  page: number;
  limit: number;
  tag?: string;
  status?: CampaignStatus;
  sort?: "newest" | "most_funded" | "ending_soon";
}

export interface CampaignListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  fundingGoalCents: number;
  amountRaisedCents: number;
  currency: string;
  donationCount: number;
  progressPercentage: number;
  status: string;
  tags: string[];
  startDate: string;
  endDate: string | null;
}

export interface ListPublicCampaigns {
  execute(
    input: ListPublicCampaignsInput,
  ): Promise<PaginatedResult<CampaignListItem>>;
}
