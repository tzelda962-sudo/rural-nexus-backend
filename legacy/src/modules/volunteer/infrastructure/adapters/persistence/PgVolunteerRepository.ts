import { Pool } from "pg";
import {
  PaginatedResult,
  PaginationParams,
  buildPaginatedResult,
} from "../../../../../shared/application/PaginatedQuery";
import { Email } from "../../../../../shared/domain/value-objects/Email";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { Volunteer } from "../../../domain/entities/Volunteer";
import {
  VolunteerRepository,
  VolunteerSearchFilters,
} from "../../../domain/ports/outbound/VolunteerRepository";
import { VolunteerRow, volunteerFromRow } from "./volunteer.mapper";

const SELECT_COLUMNS = `id, user_id, first_name, last_name, email, phone,
    skills, availability, status, notes, background_check_status,
    total_hours_logged, joined_at, updated_at`;

export class PgVolunteerRepository
  extends BaseRepository
  implements VolunteerRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(volunteer: Volunteer): Promise<void> {
    await this.pool.query(
      `INSERT INTO volunteers
         (id, user_id, first_name, last_name, email, phone, skills, availability,
          status, notes, background_check_status, total_hours_logged,
          joined_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO UPDATE SET
         first_name              = EXCLUDED.first_name,
         last_name               = EXCLUDED.last_name,
         email                   = EXCLUDED.email,
         phone                   = EXCLUDED.phone,
         skills                  = EXCLUDED.skills,
         availability            = EXCLUDED.availability,
         status                  = EXCLUDED.status,
         notes                   = EXCLUDED.notes,
         background_check_status = EXCLUDED.background_check_status,
         total_hours_logged      = EXCLUDED.total_hours_logged,
         updated_at              = EXCLUDED.updated_at`,
      [
        volunteer.id.value,
        volunteer.userId.value,
        volunteer.firstName,
        volunteer.lastName,
        volunteer.email.value,
        volunteer.phone?.value ?? null,
        JSON.stringify(volunteer.skills.map((s) => s.toJSON())),
        JSON.stringify(volunteer.availability.toJSON()),
        volunteer.status,
        volunteer.notes,
        volunteer.backgroundCheckStatus,
        volunteer.totalHoursLogged,
        volunteer.joinedAt,
        volunteer.updatedAt,
      ],
    );
  }

  async findById(id: UniqueId): Promise<Volunteer | null> {
    const row = await this.queryOne<VolunteerRow>(
      `SELECT ${SELECT_COLUMNS} FROM volunteers WHERE id = $1`,
      [id.value],
    );
    return row ? volunteerFromRow(row) : null;
  }

  async findByUserId(userId: UniqueId): Promise<Volunteer | null> {
    const row = await this.queryOne<VolunteerRow>(
      `SELECT ${SELECT_COLUMNS} FROM volunteers WHERE user_id = $1`,
      [userId.value],
    );
    return row ? volunteerFromRow(row) : null;
  }

  async findByEmail(email: Email): Promise<Volunteer | null> {
    const row = await this.queryOne<VolunteerRow>(
      `SELECT ${SELECT_COLUMNS} FROM volunteers WHERE email = $1`,
      [email.value],
    );
    return row ? volunteerFromRow(row) : null;
  }

  async search(
    filters: VolunteerSearchFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Volunteer>> {
    const where: string[] = [];
    const params: unknown[] = [];
    const add = (clause: string, value: unknown): void => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };

    if (filters.status) add("status = ?", filters.status);
    if (filters.minHoursPerWeek !== undefined) {
      add(
        "(availability->>'hoursPerWeek')::int >= ?",
        filters.minHoursPerWeek,
      );
    }
    if (filters.skills && filters.skills.length > 0) {
      // Skills stored as JSONB array of {name, proficiency}.
      // Match if any requested skill name (case-insensitive) appears.
      const lowered = filters.skills.map((s) => s.toLowerCase());
      add(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(skills) AS sk
           WHERE LOWER(sk->>'name') = ANY(?::text[])
        )`,
        lowered,
      );
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countRow = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*)::bigint AS count FROM volunteers ${whereSql}`,
      params,
    );
    const total = Number(countRow?.count ?? 0);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await this.query<VolunteerRow>(
      `SELECT ${SELECT_COLUMNS} FROM volunteers
         ${whereSql}
        ORDER BY joined_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pagination.limit, offset],
    );

    return buildPaginatedResult(rows.map(volunteerFromRow), total, pagination);
  }

  async countActive(): Promise<number> {
    const row = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*)::bigint AS count FROM volunteers WHERE status = 'ACTIVE'`,
    );
    return Number(row?.count ?? 0);
  }

  async delete(id: UniqueId): Promise<void> {
    await this.pool.query("DELETE FROM volunteers WHERE id = $1", [id.value]);
  }
}
