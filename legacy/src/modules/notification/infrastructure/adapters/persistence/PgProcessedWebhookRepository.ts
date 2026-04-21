import { Pool } from "pg";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import {
  ProcessedWebhookRepository,
  ProcessedWebhookResult,
} from "../../../domain/ports/outbound/ProcessedWebhookRepository";

export class PgProcessedWebhookRepository
  extends BaseRepository
  implements ProcessedWebhookRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async findByKey(
    idempotencyKey: string,
  ): Promise<ProcessedWebhookResult | null> {
    const row = await this.queryOne<{ result: ProcessedWebhookResult }>(
      `SELECT result FROM processed_webhooks WHERE idempotency_key = $1`,
      [idempotencyKey],
    );
    return row?.result ?? null;
  }

  async save(params: {
    idempotencyKey: string;
    provider: string;
    eventType: string;
    result: ProcessedWebhookResult;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO processed_webhooks
         (idempotency_key, provider, event_type, result, processed_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (idempotency_key) DO NOTHING`,
      [
        params.idempotencyKey,
        params.provider,
        params.eventType,
        JSON.stringify(params.result),
      ],
    );
  }
}
