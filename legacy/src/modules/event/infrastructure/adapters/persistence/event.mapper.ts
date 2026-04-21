import { Slug } from "../../../../../shared/domain/value-objects/Slug";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Event } from "../../../domain/entities/Event";
import { EventRegistration } from "../../../domain/entities/EventRegistration";
import { EventLocation } from "../../../domain/value-objects/EventLocation";
import { EventStatus } from "../../../domain/value-objects/EventStatus";
import { EventType } from "../../../domain/value-objects/EventType";

export interface EventRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: EventType;
  campaign_id: string | null;
  venue: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  is_virtual: boolean;
  virtual_link: string | null;
  start_date: Date;
  end_date: Date;
  max_attendees: number | null;
  registration_count: number;
  status: EventStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface EventRegistrationRow {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: Date;
  cancelled_at: Date | null;
}

export function eventFromRow(row: EventRow): Event {
  const location = EventLocation.create({
    venue: row.venue,
    address: row.address,
    coordinates:
      row.latitude !== null && row.longitude !== null
        ? { lat: row.latitude, lng: row.longitude }
        : null,
    isVirtual: row.is_virtual,
    virtualLink: row.virtual_link,
  });

  return Event.rehydrate(UniqueId.fromString(row.id), {
    title: row.title,
    slug: Slug.create(row.slug),
    description: row.description,
    type: row.type,
    campaignId: row.campaign_id
      ? UniqueId.fromString(row.campaign_id)
      : null,
    location,
    startDate: row.start_date,
    endDate: row.end_date,
    maxAttendees: row.max_attendees,
    registrationCount: row.registration_count,
    status: row.status,
    createdBy: UniqueId.fromString(row.created_by),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function registrationFromRow(
  row: EventRegistrationRow,
): EventRegistration {
  return EventRegistration.rehydrate(UniqueId.fromString(row.id), {
    eventId: UniqueId.fromString(row.event_id),
    userId: UniqueId.fromString(row.user_id),
    registeredAt: row.registered_at,
    cancelledAt: row.cancelled_at,
  });
}
