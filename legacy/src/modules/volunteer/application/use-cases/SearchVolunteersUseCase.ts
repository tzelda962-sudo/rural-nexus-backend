import {
  PaginatedResult,
  buildPaginatedResult,
  normalizePagination,
} from "../../../../shared/application/PaginatedQuery";
import {
  SearchVolunteers,
  SearchVolunteersInput,
} from "../../domain/ports/inbound/SearchVolunteers";
import { VolunteerRepository } from "../../domain/ports/outbound/VolunteerRepository";
import {
  VolunteerResponseDto,
  toVolunteerResponseDto,
} from "../dtos/VolunteerResponseDto";

export class SearchVolunteersUseCase implements SearchVolunteers {
  constructor(private readonly volunteers: VolunteerRepository) {}

  async execute(
    input: SearchVolunteersInput,
  ): Promise<PaginatedResult<VolunteerResponseDto>> {
    const pagination = normalizePagination(input.pagination);
    const result = await this.volunteers.search(input.filters ?? {}, pagination);
    return buildPaginatedResult(
      result.data.map(toVolunteerResponseDto),
      result.meta.total,
      pagination,
    );
  }
}
