import { Role } from "../../entities/Role";
import { RoleName } from "../../value-objects/RoleName";

export interface RoleRepository {
  findByName(name: RoleName): Promise<Role | null>;
  findAll(): Promise<Role[]>;
}
