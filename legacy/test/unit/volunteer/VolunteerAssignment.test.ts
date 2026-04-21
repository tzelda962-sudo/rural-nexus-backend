import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../src/shared/domain/errors/ConflictError";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { VolunteerAssignment } from "../../../src/modules/volunteer/domain/entities/VolunteerAssignment";

const tomorrow = new Date(Date.now() + 86_400_000);
const nextWeek = new Date(Date.now() + 604_800_000);

function makeAssignment(
  overrides?: Partial<Parameters<typeof VolunteerAssignment.create>[0]>,
): VolunteerAssignment {
  return VolunteerAssignment.create({
    volunteerId: UniqueId.generate(),
    campaignId: UniqueId.generate(),
    role: "Field Coordinator",
    startDate: tomorrow,
    hoursCommitted: 20,
    ...overrides,
  });
}

describe("VolunteerAssignment entity", () => {
  it("creates with ASSIGNED status", () => {
    const a = makeAssignment();
    expect(a.status).toBe("ASSIGNED");
    expect(a.role).toBe("Field Coordinator");
    expect(a.hoursCommitted).toBe(20);
    expect(a.hoursLogged).toBe(0);
    expect(a.endDate).toBeNull();
  });

  it("accepts optional endDate", () => {
    const a = makeAssignment({ endDate: nextWeek });
    expect(a.endDate).toEqual(nextWeek);
  });

  it("rejects empty role", () => {
    expect(() => makeAssignment({ role: "" })).toThrow(ValidationError);
  });

  it("rejects role over 100 characters", () => {
    expect(() => makeAssignment({ role: "x".repeat(101) })).toThrow(
      ValidationError,
    );
  });

  it("rejects negative hoursCommitted", () => {
    expect(() => makeAssignment({ hoursCommitted: -5 })).toThrow(
      ValidationError,
    );
  });

  it("rejects endDate before startDate", () => {
    const start = new Date("2026-06-15");
    const end = new Date("2026-06-10");
    expect(() => makeAssignment({ startDate: start, endDate: end })).toThrow(
      ValidationError,
    );
  });

  // ── State transitions ──────────────────────────────

  it("activate transitions ASSIGNED → ACTIVE", () => {
    const a = makeAssignment();
    a.activate();
    expect(a.status).toBe("ACTIVE");
  });

  it("activate rejects non-ASSIGNED", () => {
    const a = makeAssignment();
    a.activate();
    expect(() => a.activate()).toThrow(ConflictError);
  });

  it("complete transitions ACTIVE → COMPLETED with hours", () => {
    const a = makeAssignment();
    a.activate();
    a.complete(18.5);
    expect(a.status).toBe("COMPLETED");
    expect(a.hoursLogged).toBe(18.5);
  });

  it("complete rejects non-ACTIVE", () => {
    const a = makeAssignment();
    expect(() => a.complete(10)).toThrow(ConflictError);
  });

  it("complete rejects negative hours", () => {
    const a = makeAssignment();
    a.activate();
    expect(() => a.complete(-1)).toThrow(ValidationError);
  });

  it("withdraw transitions ASSIGNED → WITHDRAWN", () => {
    const a = makeAssignment();
    a.withdraw();
    expect(a.status).toBe("WITHDRAWN");
  });

  it("withdraw transitions ACTIVE → WITHDRAWN", () => {
    const a = makeAssignment();
    a.activate();
    a.withdraw();
    expect(a.status).toBe("WITHDRAWN");
  });

  it("withdraw rejects COMPLETED", () => {
    const a = makeAssignment();
    a.activate();
    a.complete(10);
    expect(() => a.withdraw()).toThrow(ConflictError);
  });

  it("withdraw rejects already WITHDRAWN", () => {
    const a = makeAssignment();
    a.withdraw();
    expect(() => a.withdraw()).toThrow(ConflictError);
  });

  it("rehydrate restores state", () => {
    const id = UniqueId.generate();
    const volunteerId = UniqueId.generate();
    const campaignId = UniqueId.generate();
    const a = VolunteerAssignment.rehydrate(id, {
      volunteerId,
      campaignId,
      role: "Driver",
      startDate: tomorrow,
      endDate: nextWeek,
      hoursCommitted: 40,
      hoursLogged: 35,
      status: "COMPLETED",
      createdAt: new Date(),
    });
    expect(a.id.value).toBe(id.value);
    expect(a.status).toBe("COMPLETED");
    expect(a.hoursLogged).toBe(35);
  });
});
