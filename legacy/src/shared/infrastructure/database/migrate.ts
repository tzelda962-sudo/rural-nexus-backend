/**
 * Lightweight SQL migration runner.
 * - Scans ./src/shared/infrastructure/database/migrations for files matching NNNN_name.sql
 * - Applies any not yet recorded in `schema_migrations`
 * - Each migration runs in a transaction; failure rolls back and aborts
 *
 * Usage:
 *   tsx src/shared/infrastructure/database/migrate.ts up
 *   tsx src/shared/infrastructure/database/migrate.ts status
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";
import { loadEnv } from "../config/env";

const MIGRATIONS_DIR = join(__dirname, "migrations");
const FILE_PATTERN = /^(\d{4})_([a-z0-9_]+)\.sql$/;

interface Migration {
  id: string;
  name: string;
  filename: string;
  sql: string;
}

function loadMigrations(): Migration[] {
  let files: string[];
  try {
    files = readdirSync(MIGRATIONS_DIR);
  } catch {
    return [];
  }
  const migrations: Migration[] = [];
  for (const file of files) {
    const match = file.match(FILE_PATTERN);
    if (!match) continue;
    const id = match[1]!;
    const name = match[2]!;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
    migrations.push({ id, name, filename: file, sql });
  }
  migrations.sort((a, b) => a.id.localeCompare(b.id));
  return migrations;
}

async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedIds(pool: Pool): Promise<Set<string>> {
  const result = await pool.query<{ id: string }>(
    "SELECT id FROM schema_migrations ORDER BY id",
  );
  return new Set(result.rows.map((r) => r.id));
}

async function applyMigration(pool: Pool, migration: Migration): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(migration.sql);
    await client.query(
      "INSERT INTO schema_migrations (id, name) VALUES ($1, $2)",
      [migration.id, migration.name],
    );
    await client.query("COMMIT");
    // eslint-disable-next-line no-console
    console.log(`  ✔ applied ${migration.filename}`);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

async function up(pool: Pool): Promise<void> {
  await ensureMigrationsTable(pool);
  const applied = await getAppliedIds(pool);
  const migrations = loadMigrations();
  const pending = migrations.filter((m) => !applied.has(m.id));

  if (pending.length === 0) {
    // eslint-disable-next-line no-console
    console.log("No pending migrations.");
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`Applying ${pending.length} migration(s)...`);
  for (const migration of pending) {
    await applyMigration(pool, migration);
  }
  // eslint-disable-next-line no-console
  console.log("✔ Migrations complete.");
}

async function status(pool: Pool): Promise<void> {
  await ensureMigrationsTable(pool);
  const applied = await getAppliedIds(pool);
  const migrations = loadMigrations();
  // eslint-disable-next-line no-console
  console.log("Migration status:");
  for (const m of migrations) {
    const mark = applied.has(m.id) ? "✔" : "·";
    // eslint-disable-next-line no-console
    console.log(`  ${mark} ${m.id}  ${m.name}`);
  }
}

async function main(): Promise<void> {
  const cmd = process.argv[2] ?? "up";
  const env = loadEnv();
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    if (cmd === "up") await up(pool);
    else if (cmd === "status") await status(pool);
    else {
      // eslint-disable-next-line no-console
      console.error(`Unknown command: ${cmd}. Use 'up' or 'status'.`);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Migration failed:", err);
    process.exit(1);
  });
}
