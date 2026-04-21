import { Pool } from "pg";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { Program } from "../../../domain/entities/Program";
import { ProgramRepository } from "../../../domain/ports/outbound/ProgramRepository";
import { ProgramStatus } from "../../../domain/value-objects/ProgramStatus";

interface ProgramRow {
  id: string;
  name: string;
  description: string | null;
  campaign_id: string | null;
  capacity: number | string;
  enrolled_count: number | string;
  status: ProgramStatus;
  created_at: Date;
}

function fromRow(row: ProgramRow): Program {
  return Program.rehydrate(UniqueId.fromString(row.id), {
    name: row.name,
    description: row.description ?? "",
    campaignId: row.campaign_id
      ? UniqueId.fromString(row.campaign_id)
      : null,
    capacity: Number(row.capacity),
    enrolledCount: Number(row.enrolled_count),
    status: row.status,
    createdAt: row.created_at,
  });
}

const SELECT_COLUMNS = `id, name, description, campaign_id, capacity,
    enrolled_count, status, created_at`;

export class PgProgramRepository
  extends BaseRepository
  implements ProgramRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(program: Program): Promise<void> {
    await this.pool.query(
      `INSERT INTO programs
         (id, name, description, campaign_id, capacity, enrolled_count, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         name           = EXCLUDED.name,
         description    = EXCLUDED.description,
         campaign_id    = EXCLUDED.campaign_id,
         capacity       = EXCLUDED.capacity,
         enrolled_count = EXCLUDED.enrolled_count,
         status         = EXCLUDED.status`,
      [
        program.id.value,
        program.name,
        program.description,
        program.campaignId?.value ?? null,
        program.capacity,
        program.enrolledCount,
        program.status,
        program.createdAt,
      ],
    );
  }

  async findById(id: UniqueId): Promise<Program | null> {
    const row = await this.queryOne<ProgramRow>(
      `SELECT ${SELECT_COLUMNS} FROM programs WHERE id = $1`,
      [id.value],
    );
    return row ? fromRow(row) : null;
  }

  async findAll(): Promise<Program[]> {
    const rows = await this.query<ProgramRow>(
      `SELECT ${SELECT_COLUMNS} FROM programs ORDER BY created_at DESC`,
    );
    return rows.map(fromRow);
  }
}
