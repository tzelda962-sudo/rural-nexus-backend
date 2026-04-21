import { Pool, PoolConfig } from "pg";
import { Env } from "../config/env";

export type PgPool = Pool;

export function createPgPool(env: Env): Pool {
  const config: PoolConfig = {
    connectionString: env.DATABASE_URL,
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: "ngo-api",
  };

  // Render's managed Postgres requires TLS in production
  if (env.NODE_ENV === "production") {
    config.ssl = { rejectUnauthorized: false };
  }

  const pool = new Pool(config);

  pool.on("error", (err) => {
    // Fatal: unexpected error on idle client — log and let process manager restart.
    // eslint-disable-next-line no-console
    console.error("[pg-pool] idle client error", err);
  });

  return pool;
}
