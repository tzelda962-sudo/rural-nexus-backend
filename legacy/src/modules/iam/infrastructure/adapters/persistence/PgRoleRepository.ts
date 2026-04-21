import { Pool } from "pg";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { Role } from "../../../domain/entities/Role";
import { RoleRepository } from "../../../domain/ports/outbound/RoleRepository";
import { RoleName } from "../../../domain/value-objects/RoleName";
import { RoleRow, roleFromRow } from "./user.mapper";

export class PgRoleRepository extends BaseRepository implements RoleRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async findByName(name: RoleName): Promise<Role | null> {
    const row = await this.queryOne<RoleRow>(
      `SELECT id, name, description, permissions, is_system
         FROM roles
        WHERE name = $1`,
      [name],
    );
    return row ? roleFromRow(row) : null;
  }

  async findAll(): Promise<Role[]> {
    const rows = await this.query<RoleRow>(
      `SELECT id, name, description, permissions, is_system
         FROM roles
        ORDER BY name`,
    );
    return rows.map(roleFromRow);
  }
}
