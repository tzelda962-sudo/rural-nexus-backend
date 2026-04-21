import { Pool } from "pg";

/**
 * Base class for PostgreSQL repositories.
 * Provides query helpers; concrete repos implement domain ports.
 */
export abstract class BaseRepository {
  constructor(protected readonly pool: Pool) {}

  protected async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.pool.query(sql, params as unknown[] | undefined);
    return result.rows as T[];
  }

  protected async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }
}
