import { Pool } from "pg";
import {
  PaginatedResult,
  PaginationParams,
  buildPaginatedResult,
} from "../../../../../shared/application/PaginatedQuery";
import { Slug } from "../../../../../shared/domain/value-objects/Slug";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { Event } from "../../../domain/entities/Event";
import {
  EventFilters,
  EventRepository,
} from "../../../domain/ports/outbound/EventRepository";
import { EventRow, eventFromRow } from "./event.mapper";

const SELECT_COLUMNS = `id, title, slug, description, type, campaign_id,
    venue, address, latitude, longitude, is_virtual, virtual_link,
    start_date, end_date, max_attendees, registration_count,
    status, created_by, created_at, updated_at`;

export class PgEventRepository
  extends BaseRepository
  implements EventRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(event: Event): Promise<void> {
    const loc = event.location;
    await this.pool.query(
      `INSERT INTO events
         (id, title, slug, description, type, campaign_id,
          venue, address, latitude, longitude, is_virtual, virtual_link,
          start_date, end_date, max_attendees, registration_count,
          status, created_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       ON CONFLICT (id) DO UPDATE SET
         title              = EXCLUDED.title,
         slug               = EXCLUDED.slug,
         description        = EXCLUDED.description,
         type               = EXCLUDED.type,
         campaign_id        = EXCLUDED.campaign_id,
         venue              = EXCLUDED.venue,
         address            = EXCLUDED.address,
         latitude           = EXCLUDED.latitude,
         longitude          = EXCLUDED.longitude,
         is_virtual         = EXCLUDED.is_virtual,
         virtual_link       = EXCLUDED.virtual_link,
         start_date         = EXCLUDED.start_date,
         end_date           = EXCLUDED.end_date,
         max_attendees      = EXCLUDED.max_attendees,
         registration_count = EXCLUDED.registration_count,
         status             = EXCLUDED.status,
         updated_at         = EXCLUDED.updated_at`,
      [
        event.id.value,
        event.title,
        event.slug.value,
        event.description,
        event.type,
        event.campaignId?.value ?? null,
        loc.venue,
        loc.address,
        loc.coordinates?.lat ?? null,
        loc.coordinates?.lng ?? null,
        loc.isVirtual,
        loc.virtualLink,
        event.startDate,
        event.endDate,
        event.maxAttendees,
        event.registrationCount,
        event.status,
        event.createdBy.value,
        event.createdAt,
        event.updatedAt,
      ],
    );
  }

  async findById(id: UniqueId): Promise<Event | null> {
    const row = await this.queryOne<EventRow>(
      `SELECT ${SELECT_COLUMNS} FROM events WHERE id = $1`,
      [id.value],
    );
    return row ? eventFromRow(row) : null;
  }

  async findBySlug(slug: Slug): Promise<Event | null> {
    const row = await this.queryOne<EventRow>(
      `SELECT ${SELECT_COLUMNS} FROM events WHERE slug = $1`,
      [slug.value],
    );
    return row ? eventFromRow(row) : null;
  }

  async findAll(
    pagination: PaginationParams,
    filters?: EventFilters,
  ): Promise<PaginatedResult<Event>> {
    const where: string[] = [];
    const params: unknown[] = [];
    const add = (clause: string, value: unknown): void => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };

    if (filters?.type) add("type = ?", filters.type);
    if (filters?.status) add("status = ?", filters.status);

    const whereSql =
      where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const countRow = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*)::bigint AS count FROM events ${whereSql}`,
      params,
    );
    const total = Number(countRow?.count ?? 0);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await this.query<EventRow>(
      `SELECT ${SELECT_COLUMNS} FROM events
         ${whereSql}
        ORDER BY start_date ASC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pagination.limit, offset],
    );

    return buildPaginatedResult(rows.map(eventFromRow), total, pagination);
  }
}
