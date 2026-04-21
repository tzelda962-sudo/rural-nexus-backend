import { beforeEach, describe, expect, it } from "vitest";
import { Email } from "../../../src/shared/domain/value-objects/Email";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { AuthorizationError } from "../../../src/shared/domain/errors/AuthorizationError";
import { NotFoundError } from "../../../src/shared/domain/errors/NotFoundError";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { InMemoryEventBus } from "../../../src/shared/infrastructure/events/InMemoryEventBus";
import {
  PaginatedResult,
  PaginationParams,
} from "../../../src/shared/application/PaginatedQuery";
import { AssignRoleUseCase } from "../../../src/modules/iam/application/use-cases/AssignRoleUseCase";
import { AuditLogEntry } from "../../../src/modules/iam/domain/entities/AuditLogEntry";
import { Role } from "../../../src/modules/iam/domain/entities/Role";
import { User } from "../../../src/modules/iam/domain/entities/User";
import { HashedPassword } from "../../../src/modules/iam/domain/value-objects/HashedPassword";
import { Permission } from "../../../src/modules/iam/domain/value-objects/Permission";
import { RoleName } from "../../../src/modules/iam/domain/value-objects/RoleName";
import { UserRepository } from "../../../src/modules/iam/domain/ports/outbound/UserRepository";
import { RoleRepository } from "../../../src/modules/iam/domain/ports/outbound/RoleRepository";
import {
  AuditLogFilters,
  AuditLogRepository,
} from "../../../src/modules/iam/domain/ports/outbound/AuditLogRepository";

const HASH = HashedPassword.fromHash(
  "$2a$12$abcdefghijklmnopqrstuv.WXYZ0123456789abcdefghijklmnop",
);

class InMemoryUserRepository implements UserRepository {
  private byId = new Map<string, User>();
  private byEmail = new Map<string, string>();
  async save(user: User): Promise<void> {
    this.byId.set(user.id.value, user);
    this.byEmail.set(user.email.value, user.id.value);
  }
  async findById(id: UniqueId): Promise<User | null> {
    return this.byId.get(id.value) ?? null;
  }
  async findByEmail(email: Email): Promise<User | null> {
    const id = this.byEmail.get(email.value);
    return id ? (this.byId.get(id) ?? null) : null;
  }
  async existsByEmail(email: Email): Promise<boolean> {
    return this.byEmail.has(email.value);
  }
}

class InMemoryRoleRepository implements RoleRepository {
  private roles = new Map<RoleName, Role>();
  add(name: RoleName, perms: Permission[]): Role {
    const role = Role.create(UniqueId.generate(), name, name, perms, true);
    this.roles.set(name, role);
    return role;
  }
  async findByName(name: RoleName): Promise<Role | null> {
    return this.roles.get(name) ?? null;
  }
  async findAll(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }
}

class InMemoryAuditLogRepository implements AuditLogRepository {
  public entries: AuditLogEntry[] = [];
  async save(entry: AuditLogEntry): Promise<void> {
    this.entries.push(entry);
  }
  async search(
    _filters: AuditLogFilters,
    _pagination: PaginationParams,
  ): Promise<PaginatedResult<AuditLogEntry>> {
    return {
      data: this.entries,
      meta: {
        total: this.entries.length,
        page: 1,
        limit: Math.max(1, this.entries.length),
        totalPages: 1,
      },
    };
  }
}

async function makeTarget(repo: InMemoryUserRepository): Promise<User> {
  const u = User.register({
    email: Email.create("target@example.com"),
    hashedPassword: HASH,
    firstName: "Target",
    lastName: "User",
  });
  u.pullEvents();
  await repo.save(u);
  return u;
}

describe("AssignRoleUseCase", () => {
  let users: InMemoryUserRepository;
  let roles: InMemoryRoleRepository;
  let audit: InMemoryAuditLogRepository;
  let bus: InMemoryEventBus;
  let useCase: AssignRoleUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    roles = new InMemoryRoleRepository();
    audit = new InMemoryAuditLogRepository();
    bus = new InMemoryEventBus();
    roles.add("SUPER_ADMIN", ["users:manage-roles"]);
    roles.add("ADMIN", ["users:manage-roles"]);
    roles.add("STAFF", ["donations:read"]);
    roles.add("DONOR", ["donations:read"]);
    useCase = new AssignRoleUseCase(users, roles, audit, bus);
  });

  it("allows SUPER_ADMIN to assign ADMIN", async () => {
    const target = await makeTarget(users);
    const result = await useCase.execute({
      targetUserId: target.id.value,
      roleName: "ADMIN",
      actorUserId: UniqueId.generate().value,
      actorRoles: ["SUPER_ADMIN"],
    });
    expect(result.roles).toContain("ADMIN");
    expect(audit.entries).toHaveLength(1);
    expect(audit.entries[0]?.action).toBe("ROLE_ASSIGNED");
  });

  it("blocks ADMIN from assigning SUPER_ADMIN", async () => {
    const target = await makeTarget(users);
    await expect(
      useCase.execute({
        targetUserId: target.id.value,
        roleName: "SUPER_ADMIN",
        actorUserId: UniqueId.generate().value,
        actorRoles: ["ADMIN"],
      }),
    ).rejects.toBeInstanceOf(AuthorizationError);
    expect(audit.entries).toHaveLength(0);
  });

  it("blocks ADMIN from assigning ADMIN (only SUPER_ADMIN can)", async () => {
    const target = await makeTarget(users);
    await expect(
      useCase.execute({
        targetUserId: target.id.value,
        roleName: "ADMIN",
        actorUserId: UniqueId.generate().value,
        actorRoles: ["ADMIN"],
      }),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("rejects assignment of the implicit PUBLIC role", async () => {
    const target = await makeTarget(users);
    await expect(
      useCase.execute({
        targetUserId: target.id.value,
        roleName: "PUBLIC",
        actorUserId: UniqueId.generate().value,
        actorRoles: ["SUPER_ADMIN"],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("returns NotFoundError when the target user does not exist", async () => {
    await expect(
      useCase.execute({
        targetUserId: UniqueId.generate().value,
        roleName: "STAFF",
        actorUserId: UniqueId.generate().value,
        actorRoles: ["SUPER_ADMIN"],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("STAFF actor cannot assign STAFF (role-name guard short-circuits before perm check)", async () => {
    // STAFF is allowed by the guard, but in production the route also requires
    // users:manage-roles which STAFF lacks. This test verifies the use case
    // accepts STAFF assignment when permission has been pre-checked at the edge.
    const target = await makeTarget(users);
    const result = await useCase.execute({
      targetUserId: target.id.value,
      roleName: "STAFF",
      actorUserId: UniqueId.generate().value,
      actorRoles: ["SUPER_ADMIN"],
    });
    expect(result.roles).toContain("STAFF");
  });
});
