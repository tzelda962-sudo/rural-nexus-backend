import { Entity } from "../../../../shared/domain/Entity";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { Permission } from "../value-objects/Permission";
import { RoleName } from "../value-objects/RoleName";

export interface RoleProps {
  name: RoleName;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

export class Role extends Entity<RoleProps> {
  static create(
    id: UniqueId,
    name: RoleName,
    description: string,
    permissions: Permission[],
    isSystem = false,
  ): Role {
    return new Role(id, {
      name,
      description,
      permissions: [...permissions],
      isSystem,
    });
  }

  get name(): RoleName {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get permissions(): readonly Permission[] {
    return this.props.permissions;
  }

  get isSystem(): boolean {
    return this.props.isSystem;
  }

  hasPermission(permission: Permission): boolean {
    return this.props.permissions.includes(permission);
  }
}
