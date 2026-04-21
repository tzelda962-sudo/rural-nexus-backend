import { UseCase } from "../../../../../shared/application/UseCase";

export interface AssignRoleInput {
  targetUserId: string;
  roleName: string;
  actorUserId: string;
  actorRoles: string[];
}

export interface AssignRoleOutput {
  userId: string;
  roles: string[];
}

export interface AssignRole extends UseCase<AssignRoleInput, AssignRoleOutput> {}
