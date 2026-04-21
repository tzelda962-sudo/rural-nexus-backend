import {
  PaginatedResult,
  PaginationParams,
} from "../../../../../shared/application/PaginatedQuery";
import { UseCase } from "../../../../../shared/application/UseCase";
import { DonationResponseDto } from "../../../application/dtos/DonationResponseDto";
import { DonationStatus } from "../../value-objects/DonationStatus";

export interface GetDonationHistoryInput {
  donorId: string;
  pagination: PaginationParams;
  filters?: {
    status?: DonationStatus;
    campaignId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}

export interface GetDonationHistory
  extends UseCase<GetDonationHistoryInput, PaginatedResult<DonationResponseDto>> {}
