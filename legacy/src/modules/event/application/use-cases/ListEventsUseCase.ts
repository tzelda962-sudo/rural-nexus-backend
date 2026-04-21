import {
  PaginatedResult,
  PaginationParams,
} from "../../../../shared/application/PaginatedQuery";
import {
  EventFilters,
  EventListItem,
  ListEvents,
} from "../../domain/ports/inbound/ListEvents";
import { EventRepository } from "../../domain/ports/outbound/EventRepository";
import { Event } from "../../domain/entities/Event";

function toListItem(e: Event): EventListItem {
  return {
    id: e.id.value,
    title: e.title,
    slug: e.slug.value,
    description: e.description,
    type: e.type,
    location: {
      venue: e.location.venue,
      address: e.location.address,
      isVirtual: e.location.isVirtual,
    },
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    maxAttendees: e.maxAttendees,
    registrationCount: e.registrationCount,
    availableSlots: e.availableSlots,
    status: e.status,
  };
}

export class ListEventsUseCase implements ListEvents {
  constructor(private readonly events: EventRepository) {}

  async execute(
    pagination: PaginationParams,
    filters?: EventFilters,
  ): Promise<PaginatedResult<EventListItem>> {
    const result = await this.events.findAll(pagination, filters);
    return {
      data: result.data.map(toListItem),
      meta: result.meta,
    };
  }
}
