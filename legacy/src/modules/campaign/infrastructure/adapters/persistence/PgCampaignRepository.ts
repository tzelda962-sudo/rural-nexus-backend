import { Pool } from "pg";
import {
  PaginatedResult,
  PaginationParams,
  buildPaginatedResult,
} from "../../../../../shared/application/PaginatedQuery";
import { Slug } from "../../../../../shared/domain/value-objects/Slug";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { Campaign } from "../../../domain/entities/Campaign";
import {
  AdminCampaignFilters,
  CampaignRepository,
  PublicCampaignFilters,
} from "../../../domain/ports/outbound/CampaignRepository";
import { CampaignRow, campaignFromRow } from "./campaign.mapper";

const SELECT_COLUMNS = `id, title, slug, description, cover_image_url,
    funding_goal_cents, currency, is_flexible_goal, amount_raised_cents,
    donation_count, status, start_date, end_date, created_by, tags,
    is_published, published_at, created_at, updated_at`;

export class PgCampaignRepository
  extends BaseRepository
  implements CampaignRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(campaign: Campaign): Promise<void> {
    await this.pool.query(
      `INSERT INTO campaigns
         (id, title, slug, description, cover_image_url,
          funding_goal_cents, currency, is_flexible_goal, amount_raised_cents,
          donation_count, status, start_date, end_date, created_by, tags,
          is_published, published_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       ON CONFLICT (id) DO UPDATE SET
         title              = EXCLUDED.title,
         slug               = EXCLUDED.slug,
         description        = EXCLUDED.description,
         cover_image_url    = EXCLUDED.cover_image_url,
         funding_goal_cents = EXCLUDED.funding_goal_cents,
         currency           = EXCLUDED.currency,
         is_flexible_goal   = EXCLUDED.is_flexible_goal,
         amount_raised_cents= EXCLUDED.amount_raised_cents,
         donation_count     = EXCLUDED.donation_count,
         status             = EXCLUDED.status,
         start_date         = EXCLUDED.start_date,
         end_date           = EXCLUDED.end_date,
         tags               = EXCLUDED.tags,
         is_published       = EXCLUDED.is_published,
         published_at       = EXCLUDED.published_at,
         updated_at         = EXCLUDED.updated_at`,
      [
        campaign.id.value,
        campaign.title,
        campaign.slug.value,
        campaign.description,
        campaign.coverImageUrl,
        campaign.fundingGoal.target.amountCents,
        campaign.fundingGoal.target.currency,
        campaign.fundingGoal.isFlexible,
        campaign.amountRaised.amountCents,
        campaign.donationCount,
        campaign.status,
        campaign.startDate,
        campaign.endDate,
        campaign.createdBy.value,
        JSON.stringify(campaign.tags),
        campaign.isPublished,
        campaign.publishedAt,
        campaign.createdAt,
        campaign.updatedAt,
      ],
    );
  }

  async findById(id: UniqueId): Promise<Campaign | null> {
    const row = await this.queryOne<CampaignRow>(
      `SELECT ${SELECT_COLUMNS} FROM campaigns WHERE id = $1`,
      [id.value],
    );
    return row ? campaignFromRow(row) : null;
  }

  async findBySlug(slug: Slug): Promise<Campaign | null> {
    const row = await this.queryOne<CampaignRow>(
      `SELECT ${SELECT_COLUMNS} FROM campaigns WHERE slug = $1`,
      [slug.value],
    );
    return row ? campaignFromRow(row) : null;
  }

  async findPublished(
    pagination: PaginationParams,
    filters?: PublicCampaignFilters,
  ): Promise<PaginatedResult<Campaign>> {
    const where: string[] = ["is_published = true"];
    const params: unknown[] = [];
    const add = (clause: string, value: unknown): void => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };

    if (filters?.tag) add("tags @> ?::jsonb", JSON.stringify([filters.tag]));
    if (filters?.status) add("status = ?", filters.status);

    const whereSql = `WHERE ${where.join(" AND ")}`;

    let orderBy = "created_at DESC";
    if (filters?.sort === "most_funded") orderBy = "amount_raised_cents DESC";
    else if (filters?.sort === "ending_soon")
      orderBy = "end_date ASC NULLS LAST";

    const countRow = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*)::bigint AS count FROM campaigns ${whereSql}`,
      params,
    );
    const total = Number(countRow?.count ?? 0);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await this.query<CampaignRow>(
      `SELECT ${SELECT_COLUMNS} FROM campaigns
         ${whereSql}
        ORDER BY ${orderBy}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pagination.limit, offset],
    );

    return buildPaginatedResult(rows.map(campaignFromRow), total, pagination);
  }

  async findAll(
    pagination: PaginationParams,
    filters?: AdminCampaignFilters,
  ): Promise<PaginatedResult<Campaign>> {
    const where: string[] = [];
    const params: unknown[] = [];
    const add = (clause: string, value: unknown): void => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };

    if (filters?.tag) add("tags @> ?::jsonb", JSON.stringify([filters.tag]));
    if (filters?.status) add("status = ?", filters.status);

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    let orderBy = "created_at DESC";
    if (filters?.sort === "most_funded") orderBy = "amount_raised_cents DESC";
    else if (filters?.sort === "ending_soon")
      orderBy = "end_date ASC NULLS LAST";

    const countRow = await this.queryOne<{ count: string }>(
      `SELECT COUNT(*)::bigint AS count FROM campaigns ${whereSql}`,
      params,
    );
    const total = Number(countRow?.count ?? 0);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await this.query<CampaignRow>(
      `SELECT ${SELECT_COLUMNS} FROM campaigns
         ${whereSql}
        ORDER BY ${orderBy}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pagination.limit, offset],
    );

    return buildPaginatedResult(rows.map(campaignFromRow), total, pagination);
  }

  async delete(id: UniqueId): Promise<void> {
    await this.pool.query("DELETE FROM campaigns WHERE id = $1", [id.value]);
  }

  async findByCreator(userId: UniqueId): Promise<Campaign[]> {
    const rows = await this.query<CampaignRow>(
      `SELECT ${SELECT_COLUMNS} FROM campaigns
        WHERE created_by = $1
        ORDER BY created_at DESC`,
      [userId.value],
    );
    return rows.map(campaignFromRow);
  }
}
