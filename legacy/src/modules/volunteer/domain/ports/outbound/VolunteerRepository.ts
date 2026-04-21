import {
  PaginatedResult,
  PaginationParams,
} from "../../../../../shared/application/PaginatedQuery";
import { Email } from "../../../../../shared/domain/value-objects/Email";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Volunteer } from "../../entities/Volunteer";
import { VolunteerStatus } from "../../value-objects/VolunteerStatus";

export interface VolunteerSearchFilters {
  skills?: string[];
  status?: VolunteerStatus;
  minHoursPerWeek?: number;
}

export interface VolunteerRepository {
  save(volunteer: Volunteer): Promise<void>;
  findById(id: UniqueId): Promise<Volunteer | null>;
  findByUserId(userId: UniqueId): Promise<Volunteer | null>;
  findByEmail(email: Email): Promise<Volunteer | null>;
  search(
    filters: VolunteerSearchFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Volunteer>>;
  countActive(): Promise<number>;
  delete(id: UniqueId): Promise<void>;
}
