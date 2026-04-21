import { Pool, PoolClient } from "pg";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { Email } from "../../../../../shared/domain/value-objects/Email";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../domain/ports/outbound/UserRepository";
import { Role } from "../../../domain/entities/Role";
import { RoleRow, UserRow, roleFromRow, userFromRow } from "./user.mapper";

export class PgUserRepository extends BaseRepository implements UserRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async save(user: User): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await this.upsertUser(client, user);
      await this.syncRoles(client, user);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  async findById(id: UniqueId): Promise<User | null> {
    const row = await this.queryOne<UserRow>(
      `SELECT id, email, hashed_password, first_name, last_name, is_active,
              is_email_verified, failed_login_attempts, locked_until,
              last_login_at, created_at, updated_at
         FROM users
        WHERE id = $1`,
      [id.value],
    );
    if (!row) return null;
    const roles = await this.loadRolesForUser(row.id);
    return userFromRow(row, roles);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.queryOne<UserRow>(
      `SELECT id, email, hashed_password, first_name, last_name, is_active,
              is_email_verified, failed_login_attempts, locked_until,
              last_login_at, created_at, updated_at
         FROM users
        WHERE email = $1`,
      [email.value],
    );
    if (!row) return null;
    const roles = await this.loadRolesForUser(row.id);
    return userFromRow(row, roles);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const row = await this.queryOne<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists`,
      [email.value],
    );
    return row?.exists ?? false;
  }

  private async upsertUser(client: PoolClient, user: User): Promise<void> {
    await client.query(
      `INSERT INTO users (
          id, email, hashed_password, first_name, last_name, is_active,
          is_email_verified, failed_login_attempts, locked_until,
          last_login_at, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          hashed_password = EXCLUDED.hashed_password,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          is_active = EXCLUDED.is_active,
          is_email_verified = EXCLUDED.is_email_verified,
          failed_login_attempts = EXCLUDED.failed_login_attempts,
          locked_until = EXCLUDED.locked_until,
          last_login_at = EXCLUDED.last_login_at,
          updated_at = EXCLUDED.updated_at`,
      [
        user.id.value,
        user.email.value,
        user.hashedPassword.value,
        user.firstName,
        user.lastName,
        user.isActive,
        user.isEmailVerified,
        user.failedLoginAttempts,
        user.lockedUntil,
        user.lastLoginAt,
        user.createdAt,
        user.updatedAt,
      ],
    );
  }

  private async syncRoles(client: PoolClient, user: User): Promise<void> {
    const desiredRoleIds = user.roles.map((r) => r.id.value);

    await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [user.id.value]);

    if (desiredRoleIds.length === 0) return;

    const values: string[] = [];
    const params: unknown[] = [user.id.value];
    desiredRoleIds.forEach((rid, idx) => {
      params.push(rid);
      values.push(`($1, $${idx + 2})`);
    });
    await client.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ${values.join(", ")}`,
      params,
    );
  }

  private async loadRolesForUser(userId: string): Promise<Role[]> {
    const rows = await this.query<RoleRow>(
      `SELECT r.id, r.name, r.description, r.permissions, r.is_system
         FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
        WHERE ur.user_id = $1
        ORDER BY r.name`,
      [userId],
    );
    return rows.map(roleFromRow);
  }
}
