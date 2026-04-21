import { Pool } from "pg";
import {
  PaginatedResult,
  PaginationParams,
  buildPaginatedResult,
} from "../../../../../shared/application/PaginatedQuery";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { AuditLogEntry } from "../../../domain/entities/AuditLogEntry";
import {
  AuditLogFilters,
  AuditLogRepository,
} from "../../../domain/ports/outbound/AuditLogRepository";

interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export class PgAuditLogRepository
  extends BaseRepository
  implements AuditLogRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(entry: AuditLogEntry): Promise<void> {
    await this.pool.query(
      `INSERT INTO audit_logs
         (id, user_id, action, resource, details, ip_address, user_agent, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        entry.id.value,
        entry.userId?.value ?? null,
        entry.action,
        entry.resource,
        JSON.stringify(entry.details),
        entry.ipAddress,
        entry.userAgent,
        entry.createdAt,
      ],
    );
  }

  async search(
    filters: AuditLogFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const where: string[] = [];
    const params: unknown[] = [];
    const add = (clause: string, value: unknown): void => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };

    if (filters.userId) add("user_id = ?", filters.userId);
    if (filters.action) add("action = ?", filters.action);
    if (filters.resource) add("resource = ?", filters.resource);
    if (filters.dateFrom) add("created_at >= ?", filters.dateFrom);
    if (filters.dateTo) add("created_at <= ?", filters.dateTo);

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countRow = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*)::bigint AS count FROM audit_logs ${whereSql}`,
      params,
    );
    const total = Number(countRow?.count ?? 0);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await this.query<AuditLogRow>(
      `SELECT id, user_id, action, resource, details, ip_address, user_agent, created_at
         FROM audit_logs
         ${whereSql}
        ORDER BY created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pagination.limit, offset],
    );

    const entries = rows.map((row) =>
      AuditLogEntry.rehydrate(UniqueId.fromString(row.id), {
        userId: row.user_id ? UniqueId.fromString(row.user_id) : null,
        action: row.action,
        resource: row.resource,
        details: row.details ?? {},
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at,
      }),
    );

    return buildPaginatedResult(entries, total, pagination);
  }
}
