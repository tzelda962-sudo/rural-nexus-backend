import { describe, expect, it } from "vitest";
import {
  AuthorizationError,
  UnauthenticatedError,
} from "../../../src/shared/domain/errors/AuthorizationError";
import {
  requirePermissions,
  requireRoles,
} from "../../../src/shared/infrastructure/http/plugins/rbac.plugin";

function reqWith(
  user: { userId: string; roles: string[]; permissions: string[] } | undefined,
): { user?: { userId: string; roles: string[]; permissions: string[] } } {
  return { user };
}

describe("requirePermissions", () => {
  it("throws Unauthenticated when no user is attached", async () => {
    const guard = requirePermissions("donations:read");
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      guard(reqWith(undefined) as any, {} as any),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("passes when user has all required permissions", async () => {
    const guard = requirePermissions("donations:read", "donations:write");
    await expect(
      guard(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reqWith({
          userId: "u",
          roles: ["STAFF"],
          permissions: ["donations:read", "donations:write", "campaigns:read"],
        }) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      ),
    ).resolves.toBeUndefined();
  });

  it("throws Authorization when user is missing a required permission", async () => {
    const guard = requirePermissions("users:manage-roles");
    await expect(
      guard(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reqWith({
          userId: "u",
          roles: ["STAFF"],
          permissions: ["donations:read"],
        }) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      ),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });
});

describe("requireRoles", () => {
  it("passes when user has any of the required roles", async () => {
    const guard = requireRoles("ADMIN", "SUPER_ADMIN");
    await expect(
      guard(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reqWith({ userId: "u", roles: ["ADMIN"], permissions: [] }) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      ),
    ).resolves.toBeUndefined();
  });

  it("throws Authorization when no role matches", async () => {
    const guard = requireRoles("SUPER_ADMIN");
    await expect(
      guard(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reqWith({ userId: "u", roles: ["DONOR"], permissions: [] }) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as any,
      ),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });
});
