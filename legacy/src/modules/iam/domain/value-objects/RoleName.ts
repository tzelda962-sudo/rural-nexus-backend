import { ValidationError } from "../../../../shared/domain/errors/ValidationError";

export const ROLE_NAMES = [
  "SUPER_ADMIN",
  "ADMIN",
  "STAFF",
  "VOLUNTEER",
  "DONOR",
  "PUBLIC",
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export function parseRoleName(raw: string): RoleName {
  if (!(ROLE_NAMES as readonly string[]).includes(raw)) {
    throw new ValidationError(`Invalid role name: ${raw}`);
  }
  return raw as RoleName;
}
