import { AuthorizationError } from "../../../../shared/domain/errors/AuthorizationError";
import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { AuditLogEntry } from "../../domain/entities/AuditLogEntry";
import {
  AssignRole,
  AssignRoleInput,
  AssignRoleOutput,
} from "../../domain/ports/inbound/AssignRole";
import { AuditLogRepository } from "../../domain/ports/outbound/AuditLogRepository";
import { RoleRepository } from "../../domain/ports/outbound/RoleRepository";
import { UserRepository } from "../../domain/ports/outbound/UserRepository";
import { parseRoleName } from "../../domain/value-objects/RoleName";

/**
 * Assign a role to a user.
 *
 * Guardrails:
 * - Only SUPER_ADMIN can assign SUPER_ADMIN.
 * - Only SUPER_ADMIN can assign ADMIN.
 * - STAFF cannot manage roles at all (enforced via users:manage-roles permission).
 */
export class AssignRoleUseCase implements AssignRole {
  constructor(
    private readonly users: UserRepository,
    private readonly roles: RoleRepository,
    private readonly auditLog: AuditLogRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: AssignRoleInput): Promise<AssignRoleOutput> {
    const roleName = parseRoleName(input.roleName);

    const actorIsSuperAdmin = input.actorRoles.includes("SUPER_ADMIN");
    if ((roleName === "SUPER_ADMIN" || roleName === "ADMIN") && !actorIsSuperAdmin) {
      throw new AuthorizationError(
        `Only SUPER_ADMIN may assign role ${roleName}`,
      );
    }
    if (roleName === "PUBLIC") {
      throw new ValidationError("PUBLIC role is implicit and cannot be assigned");
    }

    const targetId = UniqueId.fromString(input.targetUserId);
    const target = await this.users.findById(targetId);
    if (!target) {
      throw new NotFoundError("User", input.targetUserId);
    }

    const role = await this.roles.findByName(roleName);
    if (!role) {
      throw new NotFoundError("Role", roleName);
    }

    target.assignRole(role);
    await this.users.save(target);
    await this.eventBus.publishAll(target.pullEvents());

    await this.auditLog.save(
      AuditLogEntry.record({
        userId: UniqueId.fromString(input.actorUserId),
        action: "ROLE_ASSIGNED",
        resource: `user:${target.id.value}`,
        details: { roleName },
      }),
    );

    return {
      userId: target.id.value,
      roles: target.roles.map((r) => r.name),
    };
  }
}
