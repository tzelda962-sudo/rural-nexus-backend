import { Pool } from "pg";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { Report, ReportStatus } from "../../../domain/entities/Report";
import { ReportRepository } from "../../../domain/ports/outbound/ReportRepository";
import { ReportFormat } from "../../../domain/value-objects/ReportFormat";
import { ReportType } from "../../../domain/value-objects/ReportType";

interface ReportRow {
  id: string;
  type: ReportType;
  format: ReportFormat;
  title: string;
  parameters: Record<string, unknown>;
  status: ReportStatus;
  file_url: string | null;
  failure_reason: string | null;
  generated_by: string;
  generated_at: Date | null;
  expires_at: Date;
  created_at: Date;
}

function fromRow(row: ReportRow): Report {
  return Report.rehydrate(UniqueId.fromString(row.id), {
    type: row.type,
    format: row.format,
    title: row.title,
    parameters: row.parameters ?? {},
    status: row.status,
    fileUrl: row.file_url,
    failureReason: row.failure_reason,
    generatedBy: UniqueId.fromString(row.generated_by),
    generatedAt: row.generated_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  });
}

const SELECT_COLUMNS = `id, type, format, title, parameters, status,
    file_url, failure_reason, generated_by, generated_at, expires_at, created_at`;

export class PgReportRepository
  extends BaseRepository
  implements ReportRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(report: Report): Promise<void> {
    await this.pool.query(
      `INSERT INTO reports
         (id, type, format, title, parameters, status, file_url,
          failure_reason, generated_by, generated_at, expires_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO UPDATE SET
         status         = EXCLUDED.status,
         file_url       = EXCLUDED.file_url,
         failure_reason = EXCLUDED.failure_reason,
         generated_at   = EXCLUDED.generated_at`,
      [
        report.id.value,
        report.type,
        report.format,
        report.title,
        JSON.stringify(report.parameters),
        report.status,
        report.fileUrl,
        report.failureReason,
        report.generatedBy.value,
        report.generatedAt,
        report.expiresAt,
        report.createdAt,
      ],
    );
  }

  async findById(id: UniqueId): Promise<Report | null> {
    const row = await this.queryOne<ReportRow>(
      `SELECT ${SELECT_COLUMNS} FROM reports WHERE id = $1`,
      [id.value],
    );
    return row ? fromRow(row) : null;
  }

  async findByUser(userId: UniqueId): Promise<Report[]> {
    const rows = await this.query<ReportRow>(
      `SELECT ${SELECT_COLUMNS} FROM reports
        WHERE generated_by = $1
        ORDER BY created_at DESC`,
      [userId.value],
    );
    return rows.map(fromRow);
  }
}
