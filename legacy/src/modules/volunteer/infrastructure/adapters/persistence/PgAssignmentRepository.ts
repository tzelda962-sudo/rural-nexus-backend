import { Pool } from "pg";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { VolunteerAssignment } from "../../../domain/entities/VolunteerAssignment";
import { AssignmentRepository } from "../../../domain/ports/outbound/AssignmentRepository";

interface AssignmentRow {
  id: string;
  volunteer_id: string;
  campaign_id: string;
  role: string;
  start_date: Date;
  end_date: Date | null;
  hours_committed: number;
  hours_logged: number;
  status: "ASSIGNED" | "ACTIVE" | "COMPLETED" | "WITHDRAWN";
  created_at: Date;
}

function fromRow(row: AssignmentRow): VolunteerAssignment {
  return VolunteerAssignment.rehydrate(UniqueId.fromString(row.id), {
    volunteerId: UniqueId.fromString(row.volunteer_id),
    campaignId: UniqueId.fromString(row.campaign_id),
    role: row.role,
    startDate: row.start_date,
    endDate: row.end_date,
    hoursCommitted: Number(row.hours_committed),
    hoursLogged: Number(row.hours_logged),
    status: row.status,
    createdAt: row.created_at,
  });
}

const SELECT = `id, volunteer_id, campaign_id, role, start_date, end_date,
    hours_committed, hours_logged, status, created_at`;

export class PgAssignmentRepository
  extends BaseRepository
  implements AssignmentRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(a: VolunteerAssignment): Promise<void> {
    await this.pool.query(
      `INSERT INTO volunteer_assignments
         (id, volunteer_id, campaign_id, role, start_date, end_date,
          hours_committed, hours_logged, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         role            = EXCLUDED.role,
         start_date      = EXCLUDED.start_date,
         end_date        = EXCLUDED.end_date,
         hours_committed = EXCLUDED.hours_committed,
         hours_logged    = EXCLUDED.hours_logged,
         status          = EXCLUDED.status`,
      [
        a.id.value,
        a.volunteerId.value,
        a.campaignId.value,
        a.role,
        a.startDate,
        a.endDate,
        a.hoursCommitted,
        a.hoursLogged,
        a.status,
        a.createdAt,
      ],
    );
  }

  async findById(id: UniqueId): Promise<VolunteerAssignment | null> {
    const row = await this.queryOne<AssignmentRow>(
      `SELECT ${SELECT} FROM volunteer_assignments WHERE id = $1`,
      [id.value],
    );
    return row ? fromRow(row) : null;
  }

  async findByVolunteer(volunteerId: UniqueId): Promise<VolunteerAssignment[]> {
    const rows = await this.query<AssignmentRow>(
      `SELECT ${SELECT} FROM volunteer_assignments
       WHERE volunteer_id = $1 ORDER BY created_at DESC`,
      [volunteerId.value],
    );
    return rows.map(fromRow);
  }

  async findByCampaign(campaignId: UniqueId): Promise<VolunteerAssignment[]> {
    const rows = await this.query<AssignmentRow>(
      `SELECT ${SELECT} FROM volunteer_assignments
       WHERE campaign_id = $1 ORDER BY created_at DESC`,
      [campaignId.value],
    );
    return rows.map(fromRow);
  }

  async findActiveByVolunteerAndCampaign(
    volunteerId: UniqueId,
    campaignId: UniqueId,
  ): Promise<VolunteerAssignment | null> {
    const row = await this.queryOne<AssignmentRow>(
      `SELECT ${SELECT} FROM volunteer_assignments
       WHERE volunteer_id = $1 AND campaign_id = $2 AND status IN ('ASSIGNED','ACTIVE')
       LIMIT 1`,
      [volunteerId.value, campaignId.value],
    );
    return row ? fromRow(row) : null;
  }
}
