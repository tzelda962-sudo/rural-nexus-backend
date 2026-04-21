import { Pool, PoolClient } from "pg";
import {
  TransactionClient,
  TransactionManager,
} from "../../application/TransactionManager";

class PgTransactionClient implements TransactionClient {
  constructor(private readonly client: PoolClient) {}

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.client.query(sql, params as unknown[] | undefined);
    return result.rows as T[];
  }
}

export class PgTransactionManager implements TransactionManager {
  constructor(private readonly pool: Pool) {}

  async run<T>(work: (client: TransactionClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work(new PgTransactionClient(client));
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }
}
