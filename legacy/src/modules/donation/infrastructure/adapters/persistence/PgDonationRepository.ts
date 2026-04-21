import { Pool } from "pg";
import {
  PaginatedResult,
  PaginationParams,
  buildPaginatedResult,
} from "../../../../../shared/application/PaginatedQuery";
import { Money } from "../../../../../shared/domain/value-objects/Money";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { Donation } from "../../../domain/entities/Donation";
import {
  DonationHistoryFilters,
  DonationRepository,
} from "../../../domain/ports/outbound/DonationRepository";
import { DonationRow, donationFromRow } from "./donation.mapper";

const SELECT_COLUMNS = `id, donor_id, donor_email, amount_cents, currency,
    campaign_id, frequency, status, payment_intent_id, idempotency_key,
    metadata, failure_reason, created_at, completed_at, refunded_at`;

export class PgDonationRepository
  extends BaseRepository
  implements DonationRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(donation: Donation): Promise<void> {
    await this.pool.query(
      `INSERT INTO donations
         (id, donor_id, donor_email, amount_cents, currency, campaign_id,
          frequency, status, payment_intent_id, idempotency_key, metadata,
          failure_reason, created_at, completed_at, refunded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
         donor_id          = EXCLUDED.donor_id,
         donor_email       = EXCLUDED.donor_email,
         amount_cents      = EXCLUDED.amount_cents,
         currency          = EXCLUDED.currency,
         campaign_id       = EXCLUDED.campaign_id,
         frequency         = EXCLUDED.frequency,
         status            = EXCLUDED.status,
         payment_intent_id = EXCLUDED.payment_intent_id,
         metadata          = EXCLUDED.metadata,
         failure_reason    = EXCLUDED.failure_reason,
         completed_at      = EXCLUDED.completed_at,
         refunded_at       = EXCLUDED.refunded_at`,
      [
        donation.id.value,
        donation.donorId?.value ?? null,
        donation.donorEmail.value,
        donation.amount.amountCents,
        donation.amount.currency,
        donation.campaignId?.value ?? null,
        donation.frequency,
        donation.status,
        donation.paymentIntentId,
        donation.idempotencyKey,
        JSON.stringify(donation.metadata),
        donation.failureReason,
        donation.createdAt,
        donation.completedAt,
        donation.refundedAt,
      ],
    );
  }

  async findById(id: UniqueId): Promise<Donation | null> {
    const row = await this.queryOne<DonationRow>(
      `SELECT ${SELECT_COLUMNS} FROM donations WHERE id = $1`,
      [id.value],
    );
    return row ? donationFromRow(row) : null;
  }

  async findByIdempotencyKey(key: string): Promise<Donation | null> {
    const row = await this.queryOne<DonationRow>(
      `SELECT ${SELECT_COLUMNS} FROM donations WHERE idempotency_key = $1`,
      [key],
    );
    return row ? donationFromRow(row) : null;
  }

  async findByDonor(
    donorId: UniqueId,
    pagination: PaginationParams,
    filters?: DonationHistoryFilters,
  ): Promise<PaginatedResult<Donation>> {
    const where: string[] = ["donor_id = $1"];
    const params: unknown[] = [donorId.value];
    const add = (clause: string, value: unknown): void => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };

    if (filters?.status) add("status = ?", filters.status);
    if (filters?.campaignId) add("campaign_id = ?", filters.campaignId.value);
    if (filters?.dateFrom) add("created_at >= ?", filters.dateFrom);
    if (filters?.dateTo) add("created_at <= ?", filters.dateTo);

    const whereSql = `WHERE ${where.join(" AND ")}`;

    const countRow = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*)::bigint AS count FROM donations ${whereSql}`,
      params,
    );
    const total = Number(countRow?.count ?? 0);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await this.query<DonationRow>(
      `SELECT ${SELECT_COLUMNS} FROM donations
         ${whereSql}
        ORDER BY created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pagination.limit, offset],
    );

    return buildPaginatedResult(rows.map(donationFromRow), total, pagination);
  }

  async sumByCampaign(campaignId: UniqueId): Promise<Money> {
    const row = await this.queryOne<{ total: string | null; currency: string | null }>(
      `SELECT COALESCE(SUM(amount_cents), 0)::bigint AS total,
              MIN(currency) AS currency
         FROM donations
        WHERE campaign_id = $1 AND status = 'COMPLETED'`,
      [campaignId.value],
    );
    const currency = row?.currency ?? "USD";
    return Money.fromCents(Number(row?.total ?? 0), currency);
  }
}
