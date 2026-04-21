import {
  PaginatedResult,
  PaginationParams,
} from "../../../../../shared/application/PaginatedQuery";
import { Money } from "../../../../../shared/domain/value-objects/Money";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Donation } from "../../entities/Donation";
import { DonationStatus } from "../../value-objects/DonationStatus";

export interface DonationHistoryFilters {
  status?: DonationStatus;
  campaignId?: UniqueId;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface DonationRepository {
  save(donation: Donation): Promise<void>;
  findById(id: UniqueId): Promise<Donation | null>;
  findByIdempotencyKey(key: string): Promise<Donation | null>;
  findByDonor(
    donorId: UniqueId,
    pagination: PaginationParams,
    filters?: DonationHistoryFilters,
  ): Promise<PaginatedResult<Donation>>;
  sumByCampaign(campaignId: UniqueId): Promise<Money>;
}
