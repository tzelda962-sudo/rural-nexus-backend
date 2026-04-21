import { PaginatedResult, PaginationParams } from "../../../../../shared/application/PaginatedQuery";
import { EventType } from "../../value-objects/EventType";

export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: EventType;
  location: {
    venue: string;
    address: string;
    isVirtual: boolean;
  };
  startDate: string;
  endDate: string;
  maxAttendees: number | null;
  registrationCount: number;
  availableSlots: number | null;
  status: string;
}

export interface EventFilters {
  type?: EventType;
  status?: string;
}

export interface ListEvents {
  execute(
    pagination: PaginationParams,
    filters?: EventFilters,
  ): Promise<PaginatedResult<EventListItem>>;
}
