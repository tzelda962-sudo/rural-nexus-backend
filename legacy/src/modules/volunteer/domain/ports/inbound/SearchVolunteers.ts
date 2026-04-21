import {
  PaginatedResult,
  PaginationParams,
} from "../../../../../shared/application/PaginatedQuery";
import { UseCase } from "../../../../../shared/application/UseCase";
import { VolunteerResponseDto } from "../../../application/dtos/VolunteerResponseDto";
import { VolunteerStatus } from "../../value-objects/VolunteerStatus";

export interface SearchVolunteersInput {
  pagination: PaginationParams;
  filters?: {
    skills?: string[];
    status?: VolunteerStatus;
    minHoursPerWeek?: number;
  };
}

export interface SearchVolunteers
  extends UseCase<SearchVolunteersInput, PaginatedResult<VolunteerResponseDto>> {}
