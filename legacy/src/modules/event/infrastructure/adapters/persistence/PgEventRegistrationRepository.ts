import { Pool } from "pg";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { EventRegistration } from "../../../domain/entities/EventRegistration";
import { EventRegistrationRepository } from "../../../domain/ports/outbound/EventRegistrationRepository";
import { EventRegistrationRow, registrationFromRow } from "./event.mapper";

export class PgEventRegistrationRepository
  extends BaseRepository
  implements EventRegistrationRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(registration: EventRegistration): Promise<void> {
    await this.pool.query(
      `INSERT INTO event_registrations
         (id, event_id, user_id, registered_at, cancelled_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         cancelled_at = EXCLUDED.cancelled_at`,
      [
        registration.id.value,
        registration.eventId.value,
        registration.userId.value,
        registration.registeredAt,
        registration.cancelledAt,
      ],
    );
  }

  async findByEventAndUser(
    eventId: UniqueId,
    userId: UniqueId,
  ): Promise<EventRegistration | null> {
    const row = await this.queryOne<EventRegistrationRow>(
      `SELECT id, event_id, user_id, registered_at, cancelled_at
       FROM event_registrations
       WHERE event_id = $1 AND user_id = $2
       ORDER BY registered_at DESC
       LIMIT 1`,
      [eventId.value, userId.value],
    );
    return row ? registrationFromRow(row) : null;
  }

  async findActiveByEventAndUser(
    eventId: UniqueId,
    userId: UniqueId,
  ): Promise<EventRegistration | null> {
    const row = await this.queryOne<EventRegistrationRow>(
      `SELECT id, event_id, user_id, registered_at, cancelled_at
       FROM event_registrations
       WHERE event_id = $1 AND user_id = $2 AND cancelled_at IS NULL
       LIMIT 1`,
      [eventId.value, userId.value],
    );
    return row ? registrationFromRow(row) : null;
  }

  async countByEvent(eventId: UniqueId): Promise<number> {
    const row = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*)::bigint AS count
       FROM event_registrations
       WHERE event_id = $1 AND cancelled_at IS NULL`,
      [eventId.value],
    );
    return Number(row?.count ?? 0);
  }
}
