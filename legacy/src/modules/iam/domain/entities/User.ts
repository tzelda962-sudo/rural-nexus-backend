import { AggregateRoot } from "../../../../shared/domain/AggregateRoot";
import { AuthorizationError } from "../../../../shared/domain/errors/AuthorizationError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { Email } from "../../../../shared/domain/value-objects/Email";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { HashedPassword } from "../value-objects/HashedPassword";
import { Permission } from "../value-objects/Permission";
import { RoleName } from "../value-objects/RoleName";
import { Role } from "./Role";
import { userCreated } from "../events/UserCreated";
import { userLoggedIn } from "../events/UserLoggedIn";
import { permissionChanged } from "../events/PermissionChanged";

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;

export interface UserProps {
  email: Email;
  hashedPassword: HashedPassword;
  firstName: string;
  lastName: string;
  roles: Role[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<UserProps> {
  /**
   * Factory for a brand new user (registration flow).
   * Starts with no roles — caller layer assigns default DONOR or VOLUNTEER.
   */
  static register(params: {
    id?: UniqueId;
    email: Email;
    hashedPassword: HashedPassword;
    firstName: string;
    lastName: string;
  }): User {
    if (params.firstName.trim().length === 0) {
      throw new ValidationError("firstName cannot be empty");
    }
    if (params.lastName.trim().length === 0) {
      throw new ValidationError("lastName cannot be empty");
    }

    const now = new Date();
    const user = new User(params.id ?? UniqueId.generate(), {
      email: params.email,
      hashedPassword: params.hashedPassword,
      firstName: params.firstName.trim(),
      lastName: params.lastName.trim(),
      roles: [],
      isActive: true,
      isEmailVerified: false,
      lastLoginAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    });
    user.addDomainEvent(
      userCreated({ userId: user.id.value, email: params.email.value }),
    );
    return user;
  }

  /** Rehydrate from the repository. No invariants are re-run. */
  static rehydrate(id: UniqueId, props: UserProps): User {
    return new User(id, props);
  }

  // ── Query accessors ─────────────────────────────
  get email(): Email {
    return this.props.email;
  }
  get hashedPassword(): HashedPassword {
    return this.props.hashedPassword;
  }
  get firstName(): string {
    return this.props.firstName;
  }
  get lastName(): string {
    return this.props.lastName;
  }
  get roles(): readonly Role[] {
    return this.props.roles;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }
  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }
  get failedLoginAttempts(): number {
    return this.props.failedLoginAttempts;
  }
  get lockedUntil(): Date | null {
    return this.props.lockedUntil;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isLocked(now: Date = new Date()): boolean {
    return this.props.lockedUntil !== null && this.props.lockedUntil > now;
  }

  allPermissions(): Permission[] {
    const set = new Set<Permission>();
    for (const role of this.props.roles) {
      for (const p of role.permissions) set.add(p);
    }
    return Array.from(set);
  }

  hasPermission(permission: Permission): boolean {
    return this.props.roles.some((r) => r.hasPermission(permission));
  }

  hasRole(name: RoleName): boolean {
    return this.props.roles.some((r) => r.name === name);
  }

  // ── Mutations ───────────────────────────────────

  /**
   * Record a successful login: clears failure counter, updates timestamp.
   * The caller is responsible for verifying the plaintext password via PasswordHasher.
   */
  recordSuccessfulLogin(params: { ipAddress: string; now?: Date }): void {
    if (!this.props.isActive) {
      throw new AuthorizationError("Account is deactivated");
    }
    if (this.isLocked(params.now)) {
      throw new AuthorizationError("Account is locked");
    }
    const now = params.now ?? new Date();
    this.props.failedLoginAttempts = 0;
    this.props.lockedUntil = null;
    this.props.lastLoginAt = now;
    this.props.updatedAt = now;
    this.addDomainEvent(
      userLoggedIn({ userId: this.id.value, ipAddress: params.ipAddress }),
    );
  }

  /**
   * Record a failed login attempt. After MAX_FAILED_ATTEMPTS, lock for LOCKOUT_MINUTES.
   */
  recordFailedLogin(now: Date = new Date()): void {
    this.props.failedLoginAttempts += 1;
    this.props.updatedAt = now;
    if (this.props.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      const until = new Date(now.getTime() + LOCKOUT_MINUTES * 60_000);
      this.props.lockedUntil = until;
    }
  }

  assignRole(role: Role): void {
    if (this.hasRole(role.name)) return;
    this.props.roles = [...this.props.roles, role];
    this.props.updatedAt = new Date();
    this.addDomainEvent(
      permissionChanged({ userId: this.id.value, addedRole: role.name }),
    );
  }

  removeRole(name: RoleName): void {
    const before = this.props.roles.length;
    this.props.roles = this.props.roles.filter((r) => r.name !== name);
    if (this.props.roles.length !== before) {
      this.props.updatedAt = new Date();
      this.addDomainEvent(
        permissionChanged({ userId: this.id.value, removedRole: name }),
      );
    }
  }

  verifyEmail(): void {
    if (this.props.isEmailVerified) return;
    this.props.isEmailVerified = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    if (!this.props.isActive) return;
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.props.isActive) return;
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  changePassword(newHash: HashedPassword): void {
    this.props.hashedPassword = newHash;
    this.props.failedLoginAttempts = 0;
    this.props.lockedUntil = null;
    this.props.updatedAt = new Date();
  }
}
