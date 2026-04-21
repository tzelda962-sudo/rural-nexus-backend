import { Pool } from "pg";
import { Money } from "../../../../../shared/domain/value-objects/Money";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { ImpactMetric } from "../../../domain/entities/ImpactMetric";
import {
  GlobalSummary,
  MetricAggregateRow,
  MetricRepository,
} from "../../../domain/ports/outbound/MetricRepository";
import { MetricType } from "../../../domain/value-objects/MetricType";
import { ImpactMetricRow, metricFromRow } from "./campaign.mapper";

export class PgMetricRepository
  extends BaseRepository
  implements MetricRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(metric: ImpactMetric): Promise<void> {
    await this.pool.query(
      `INSERT INTO impact_metrics
         (id, campaign_id, type, label, value, unit, recorded_at, recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        metric.id.value,
        metric.campaignId.value,
        metric.type,
        metric.label,
        metric.value,
        metric.unit,
        metric.recordedAt,
        metric.recordedBy.value,
      ],
    );
  }

  async findByCampaign(campaignId: UniqueId): Promise<ImpactMetric[]> {
    const rows = await this.query<ImpactMetricRow>(
      `SELECT id, campaign_id, type, label, value, unit, recorded_at, recorded_by
         FROM impact_metrics
        WHERE campaign_id = $1
        ORDER BY recorded_at DESC`,
      [campaignId.value],
    );
    return rows.map(metricFromRow);
  }

  async aggregate(params: {
    campaignIds?: string[];
    types?: MetricType[];
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<MetricAggregateRow[]> {
    const where: string[] = [];
    const values: unknown[] = [];
    const add = (clause: string, value: unknown): void => {
      values.push(value);
      where.push(clause.replace("?", `$${values.length}`));
    };

    if (params.campaignIds?.length) {
      add("m.campaign_id = ANY(?::uuid[])", params.campaignIds);
    }
    if (params.types?.length) {
      add("m.type = ANY(?::text[])", params.types);
    }
    if (params.dateFrom) add("m.recorded_at >= ?", params.dateFrom);
    if (params.dateTo) add("m.recorded_at <= ?", params.dateTo);

    const whereSql =
      where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const rows = await this.query<{
      campaign_id: string;
      campaign_title: string;
      type: MetricType;
      label: string;
      total_value: string | number;
      unit: string;
    }>(
      `SELECT m.campaign_id, c.title AS campaign_title,
              m.type, m.label, SUM(m.value) AS total_value, m.unit
         FROM impact_metrics m
         JOIN campaigns c ON c.id = m.campaign_id
         ${whereSql}
        GROUP BY m.campaign_id, c.title, m.type, m.label, m.unit
        ORDER BY c.title, m.type`,
      values,
    );

    const byCampaign = new Map<string, MetricAggregateRow>();
    for (const row of rows) {
      let entry = byCampaign.get(row.campaign_id);
      if (!entry) {
        entry = {
          campaignId: row.campaign_id,
          campaignTitle: row.campaign_title,
          metrics: [],
        };
        byCampaign.set(row.campaign_id, entry);
      }
      entry.metrics.push({
        type: row.type,
        label: row.label,
        totalValue: Number(row.total_value),
        unit: row.unit,
      });
    }

    return Array.from(byCampaign.values());
  }

  async globalSummary(): Promise<GlobalSummary> {
    const row = await this.queryOne<{
      people_served: string | number;
      funds_raised: string | number;
      volunteer_hours: string | number;
      active_campaigns: string | number;
    }>(
      `SELECT
         COALESCE(SUM(CASE WHEN m.type = 'PEOPLE_SERVED' THEN m.value ELSE 0 END), 0) AS people_served,
         COALESCE(SUM(CASE WHEN m.type = 'FUNDS_DISBURSED' THEN m.value ELSE 0 END), 0) AS funds_raised,
         0 AS volunteer_hours,
         (SELECT COUNT(*) FROM campaigns WHERE status = 'ACTIVE') AS active_campaigns
       FROM impact_metrics m`,
    );

    return {
      totalPeopleServed: Number(row?.people_served ?? 0),
      totalFundsRaised: Money.fromCents(
        Math.round(Number(row?.funds_raised ?? 0) * 100),
        "USD",
      ),
      totalVolunteerHours: Number(row?.volunteer_hours ?? 0),
      activeCampaigns: Number(row?.active_campaigns ?? 0),
    };
  }
}
