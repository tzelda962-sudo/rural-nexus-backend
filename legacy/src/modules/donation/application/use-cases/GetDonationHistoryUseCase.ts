import {
  PaginatedResult,
  buildPaginatedResult,
  normalizePagination,
} from "../../../../shared/application/PaginatedQuery";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { DonationResponseDto, toDonationResponseDto } from "../dtos/DonationResponseDto";
import {
  GetDonationHistory,
  GetDonationHistoryInput,
} from "../../domain/ports/inbound/GetDonationHistory";
import { DonationRepository } from "../../domain/ports/outbound/DonationRepository";

export class GetDonationHistoryUseCase implements GetDonationHistory {
  constructor(private readonly donations: DonationRepository) {}

  async execute(
    input: GetDonationHistoryInput,
  ): Promise<PaginatedResult<DonationResponseDto>> {
    const pagination = normalizePagination(input.pagination);
    const result = await this.donations.findByDonor(
      UniqueId.fromString(input.donorId),
      pagination,
      {
        status: input.filters?.status,
        campaignId: input.filters?.campaignId
          ? UniqueId.fromString(input.filters.campaignId)
          : undefined,
        dateFrom: input.filters?.dateFrom,
        dateTo: input.filters?.dateTo,
      },
    );
    return buildPaginatedResult(
      result.data.map(toDonationResponseDto),
      result.meta.total,
      pagination,
    );
  }
}
