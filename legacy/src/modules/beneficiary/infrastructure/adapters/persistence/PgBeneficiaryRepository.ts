import { Pool } from "pg";
import {
  PaginatedResult,
  PaginationParams,
  buildPaginatedResult,
} from "../../../../../shared/application/PaginatedQuery";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { Beneficiary } from "../../../domain/entities/Beneficiary";
import { BeneficiaryRepository } from "../../../domain/ports/outbound/BeneficiaryRepository";
import { BeneficiaryStatus } from "../../../domain/value-objects/BeneficiaryStatus";

interface BeneficiaryRow {
  id: string;
  first_name: string;
  last_name: string;
  dob: Date | null;
  location: string;
  status: BeneficiaryStatus;
  notes: string | null;
  enrolled_at: Date;
  updated_at: Date;
  program_ids: string[] | null;
}

function fromRow(row: BeneficiaryRow): Beneficiary {
  const programIds = (row.program_ids ?? []).map((id) =>
    UniqueId.fromString(id),
  );
  return Beneficiary.rehydrate(UniqueId.fromString(row.id), {
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.dob,
    location: row.location,
    programIds,
    status: row.status,
    notes: row.notes ?? "",
    enrolledAt: row.enrolled_at,
    updatedAt: row.updated_at,
  });
}

const SELECT_COLUMNS = `b.id, b.first_name, b.last_name, b.dob, b.location,
    b.status, b.notes, b.enrolled_at, b.updated_at,
    ARRAY(
      SELECT bp.program_id::text FROM beneficiary_programs bp WHERE bp.beneficiary_id = b.id
    ) AS program_ids`;

export class PgBeneficiaryRepository
  extends BaseRepository
  implements BeneficiaryRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(beneficiary: Beneficiary): Promise<void> {
    await this.pool.query(
      `INSERT INTO beneficiaries
         (id, first_name, last_name, dob, location, status, notes, enrolled_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name  = EXCLUDED.last_name,
         dob        = EXCLUDED.dob,
         location   = EXCLUDED.location,
         status     = EXCLUDED.status,
         notes      = EXCLUDED.notes,
         updated_at = EXCLUDED.updated_at`,
      [
        beneficiary.id.value,
        beneficiary.firstName,
        beneficiary.lastName,
        beneficiary.dateOfBirth,
        beneficiary.location,
        beneficiary.status,
        beneficiary.notes,
        beneficiary.enrolledAt,
        beneficiary.updatedAt,
      ],
    );
  }

  async findById(id: UniqueId): Promise<Beneficiary | null> {
    const row = await this.queryOne<BeneficiaryRow>(
      `SELECT ${SELECT_COLUMNS} FROM beneficiaries b WHERE b.id = $1`,
      [id.value],
    );
    return row ? fromRow(row) : null;
  }

  async findAll(
    pagination: PaginationParams,
    filters?: { status?: BeneficiaryStatus; programId?: string },
  ): Promise<PaginatedResult<Beneficiary>> {
    const where: string[] = [];
    const params: unknown[] = [];
    const add = (clause: string, value: unknown): void => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };

    if (filters?.status) add("b.status = ?", filters.status);
    if (filters?.programId) {
      add(
        "EXISTS (SELECT 1 FROM beneficiary_programs bp WHERE bp.beneficiary_id = b.id AND bp.program_id = ?::uuid)",
        filters.programId,
      );
    }

    const whereSql =
      where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const countRow = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*)::bigint AS count FROM beneficiaries b ${whereSql}`,
      params,
    );
    const total = Number(countRow?.count ?? 0);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await this.query<BeneficiaryRow>(
      `SELECT ${SELECT_COLUMNS} FROM beneficiaries b
         ${whereSql}
        ORDER BY b.enrolled_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pagination.limit, offset],
    );

    return buildPaginatedResult(rows.map(fromRow), total, pagination);
  }

  async addProgramAssignment(
    beneficiaryId: UniqueId,
    programId: UniqueId,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO beneficiary_programs (beneficiary_id, program_id)
       VALUES ($1, $2)
       ON CONFLICT (beneficiary_id, program_id) DO NOTHING`,
      [beneficiaryId.value, programId.value],
    );
  }
}
