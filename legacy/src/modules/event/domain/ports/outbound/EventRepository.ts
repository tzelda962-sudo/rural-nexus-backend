import { PaginatedResult, PaginationParams } from "../../../../../shared/application/PaginatedQuery";
import { Slug } from "../../../../../shared/domain/value-objects/Slug";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Event } from "../../entities/Event";

export interface EventFilters {
  type?: string;
  status?: string;
}

export interface EventRepository {
  save(event: Event): Promise<void>;
  findById(id: UniqueId): Promise<Event | null>;
  findBySlug(slug: Slug): Promise<Event | null>;
  findAll(
    pagination: PaginationParams,
    filters?: EventFilters,
  ): Promise<PaginatedResult<Event>>;
}
