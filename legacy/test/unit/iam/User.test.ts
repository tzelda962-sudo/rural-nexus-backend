import { describe, expect, it } from "vitest";
import { Email } from "../../../src/shared/domain/value-objects/Email";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { Role } from "../../../src/modules/iam/domain/entities/Role";
import {
  LOCKOUT_MINUTES,
  MAX_FAILED_ATTEMPTS,
  User,
} from "../../../src/modules/iam/domain/entities/User";
import { HashedPassword } from "../../../src/modules/iam/domain/value-objects/HashedPassword";

const fakeHash = HashedPassword.fromHash(
  "$2a$12$abcdefghijklmnopqrstuv.WXYZ0123456789abcdefghijklmnop",
);

function makeUser(): User {
  return User.register({
    email: Email.create("alice@example.com"),
    hashedPassword: fakeHash,
    firstName: "Alice",
    lastName: "Anderson",
  });
}

describe("User aggregate", () => {
  it("emits userCreated on register", () => {
    const user = makeUser();
    const events = user.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe("iam.UserCreated");
  });

  it("locks the account after MAX_FAILED_ATTEMPTS failed logins", () => {
    const user = makeUser();
    const start = new Date("2026-04-12T12:00:00Z");

    for (let i = 0; i < MAX_FAILED_ATTEMPTS - 1; i += 1) {
      user.recordFailedLogin(start);
      expect(user.isLocked(start)).toBe(false);
    }

    user.recordFailedLogin(start);
    expect(user.failedLoginAttempts).toBe(MAX_FAILED_ATTEMPTS);
    expect(user.isLocked(start)).toBe(true);

    const justBefore = new Date(
      start.getTime() + LOCKOUT_MINUTES * 60_000 - 1,
    );
    expect(user.isLocked(justBefore)).toBe(true);

    const after = new Date(start.getTime() + LOCKOUT_MINUTES * 60_000 + 1);
    expect(user.isLocked(after)).toBe(false);
  });

  it("clears the failure counter on successful login", () => {
    const user = makeUser();
    user.recordFailedLogin();
    user.recordFailedLogin();
    expect(user.failedLoginAttempts).toBe(2);

    user.recordSuccessfulLogin({ ipAddress: "127.0.0.1" });
    expect(user.failedLoginAttempts).toBe(0);
    expect(user.lockedUntil).toBeNull();
    expect(user.lastLoginAt).not.toBeNull();
  });

  it("rejects successful login while locked", () => {
    const user = makeUser();
    const t = new Date("2026-04-12T12:00:00Z");
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i += 1) user.recordFailedLogin(t);

    expect(() =>
      user.recordSuccessfulLogin({ ipAddress: "127.0.0.1", now: t }),
    ).toThrow(/locked/i);
  });

  it("rejects successful login when deactivated", () => {
    const user = makeUser();
    user.deactivate();
    expect(() =>
      user.recordSuccessfulLogin({ ipAddress: "127.0.0.1" }),
    ).toThrow(/deactivated/i);
  });

  it("dedupes role assignment and aggregates permissions", () => {
    const user = makeUser();
    const staff = Role.create(
      UniqueId.generate(),
      "STAFF",
      "Staff",
      ["donations:read", "donations:write"],
      true,
    );
    const donor = Role.create(
      UniqueId.generate(),
      "DONOR",
      "Donor",
      ["donations:read"],
      true,
    );

    user.assignRole(staff);
    user.assignRole(staff); // duplicate
    user.assignRole(donor);

    expect(user.roles).toHaveLength(2);
    const perms = user.allPermissions().sort();
    expect(perms).toEqual(["donations:read", "donations:write"]);
    expect(user.hasPermission("donations:write")).toBe(true);
    expect(user.hasPermission("users:manage-roles")).toBe(false);
  });

  it("changePassword resets failed attempts and lockout", () => {
    const user = makeUser();
    const t = new Date("2026-04-12T12:00:00Z");
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i += 1) user.recordFailedLogin(t);
    expect(user.isLocked(t)).toBe(true);

    user.changePassword(fakeHash);
    expect(user.failedLoginAttempts).toBe(0);
    expect(user.lockedUntil).toBeNull();
  });
});
