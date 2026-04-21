import {
  PaginatedResult,
  PaginationParams,
} from "../../../../../shared/application/PaginatedQuery";
import { Slug } from "../../../../../shared/domain/value-objects/Slug";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Campaign } from "../../entities/Campaign";
import { CampaignStatus } from "../../value-objects/CampaignStatus";

export interface PublicCampaignFilters {
  tag?: string;
  status?: CampaignStatus;
  sort?: "newest" | "most_funded" | "ending_soon";
}

export interface AdminCampaignFilters {
  tag?: string;
  status?: CampaignStatus;
  sort?: "newest" | "most_funded" | "ending_soon";
}

export interface CampaignRepository {
  save(campaign: Campaign): Promise<void>;
  findById(id: UniqueId): Promise<Campaign | null>;
  findBySlug(slug: Slug): Promise<Campaign | null>;
  findPublished(
    pagination: PaginationParams,
    filters?: PublicCampaignFilters,
  ): Promise<PaginatedResult<Campaign>>;
  findAll(
    pagination: PaginationParams,
    filters?: AdminCampaignFilters,
  ): Promise<PaginatedResult<Campaign>>;
  findByCreator(userId: UniqueId): Promise<Campaign[]>;
  delete(id: UniqueId): Promise<void>;
}
