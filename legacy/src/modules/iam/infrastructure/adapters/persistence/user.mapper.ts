import { Email } from "../../../../../shared/domain/value-objects/Email";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Role } from "../../../domain/entities/Role";
import { User, UserProps } from "../../../domain/entities/User";
import { HashedPassword } from "../../../domain/value-objects/HashedPassword";
import { isPermission, Permission } from "../../../domain/value-objects/Permission";
import { parseRoleName } from "../../../domain/value-objects/RoleName";

export interface UserRow {
  id: string;
  email: string;
  hashed_password: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_email_verified: boolean;
  failed_login_attempts: number;
  locked_until: Date | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  permissions: string[] | null;
  is_system: boolean;
}

export function roleFromRow(row: RoleRow): Role {
  const perms: Permission[] = (row.permissions ?? []).filter(isPermission);
  return Role.create(
    UniqueId.fromString(row.id),
    parseRoleName(row.name),
    row.description ?? "",
    perms,
    row.is_system,
  );
}

export function userFromRow(row: UserRow, roles: Role[]): User {
  const props: UserProps = {
    email: Email.create(row.email),
    hashedPassword: HashedPassword.fromHash(row.hashed_password),
    firstName: row.first_name,
    lastName: row.last_name,
    roles,
    isActive: row.is_active,
    isEmailVerified: row.is_email_verified,
    lastLoginAt: row.last_login_at,
    failedLoginAttempts: row.failed_login_attempts,
    lockedUntil: row.locked_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  return User.rehydrate(UniqueId.fromString(row.id), props);
}
