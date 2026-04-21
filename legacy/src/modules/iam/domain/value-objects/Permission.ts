export const PERMISSIONS = [
  "donations:read",
  "donations:write",
  "donations:refund",
  "volunteers:read",
  "volunteers:write",
  "volunteers:assign",
  "campaigns:read",
  "campaigns:write",
  "campaigns:publish",
  "reports:read",
  "reports:generate",
  "users:read",
  "users:write",
  "users:manage-roles",
  "audit:read",
  "settings:manage",
  "beneficiaries:read",
  "beneficiaries:write",
  "events:read",
  "events:write",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}
