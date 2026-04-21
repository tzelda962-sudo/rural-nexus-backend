import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../src/shared/domain/errors/ConflictError";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { Beneficiary } from "../../../src/modules/beneficiary/domain/entities/Beneficiary";
import { Program } from "../../../src/modules/beneficiary/domain/entities/Program";

describe("Program entity", () => {
  it("creates with PLANNED status", () => {
    const p = Program.create({ name: "Literacy 101", capacity: 30 });
    expect(p.status).toBe("PLANNED");
    expect(p.enrolledCount).toBe(0);
    expect(p.availableSlots).toBe(30);
    expect(p.isFull).toBe(false);
  });

  it("rejects empty name", () => {
    expect(() => Program.create({ name: "", capacity: 10 })).toThrow(
      ValidationError,
    );
  });

  it("rejects capacity < 1", () => {
    expect(() => Program.create({ name: "X", capacity: 0 })).toThrow(
      ValidationError,
    );
  });

  it("activate transitions PLANNED → ACTIVE", () => {
    const p = Program.create({ name: "Test", capacity: 5 });
    p.activate();
    expect(p.status).toBe("ACTIVE");
  });

  it("activate rejects non-PLANNED", () => {
    const p = Program.create({ name: "Test", capacity: 5 });
    p.activate();
    expect(() => p.activate()).toThrow(ConflictError);
  });

  it("complete transitions ACTIVE → COMPLETED", () => {
    const p = Program.create({ name: "Test", capacity: 5 });
    p.activate();
    p.complete();
    expect(p.status).toBe("COMPLETED");
  });

  it("enrollOne increments count and rejects when full", () => {
    const p = Program.create({ name: "Small Class", capacity: 2 });
    p.activate();

    p.enrollOne();
    expect(p.enrolledCount).toBe(1);
    expect(p.availableSlots).toBe(1);

    p.enrollOne();
    expect(p.enrolledCount).toBe(2);
    expect(p.isFull).toBe(true);

    expect(() => p.enrollOne()).toThrow(ConflictError);
  });

  it("enrollOne rejects on non-ACTIVE program", () => {
    const p = Program.create({ name: "Test", capacity: 5 });
    expect(() => p.enrollOne()).toThrow(ConflictError);
  });
});

describe("Beneficiary entity", () => {
  it("enrolls with ACTIVE status", () => {
    const b = Beneficiary.enroll({
      firstName: "Maria",
      lastName: "Garcia",
      location: "Lagos, Nigeria",
    });
    expect(b.status).toBe("ACTIVE");
    expect(b.fullName).toBe("Maria Garcia");
    expect(b.programIds).toHaveLength(0);
  });

  it("rejects missing required fields", () => {
    expect(() =>
      Beneficiary.enroll({
        firstName: "",
        lastName: "Garcia",
        location: "Lagos",
      }),
    ).toThrow(ValidationError);

    expect(() =>
      Beneficiary.enroll({
        firstName: "Maria",
        lastName: "",
        location: "Lagos",
      }),
    ).toThrow(ValidationError);

    expect(() =>
      Beneficiary.enroll({
        firstName: "Maria",
        lastName: "Garcia",
        location: "",
      }),
    ).toThrow(ValidationError);
  });

  it("assignToProgram adds program ID (idempotent)", () => {
    const b = Beneficiary.enroll({
      firstName: "Maria",
      lastName: "Garcia",
      location: "Lagos",
    });
    const programId = UniqueId.generate();
    b.assignToProgram(programId);
    expect(b.programIds).toHaveLength(1);

    b.assignToProgram(programId);
    expect(b.programIds).toHaveLength(1);
  });

  it("assignToProgram rejects non-ACTIVE beneficiary", () => {
    const b = Beneficiary.enroll({
      firstName: "Maria",
      lastName: "Garcia",
      location: "Lagos",
    });
    b.graduate();
    expect(() => b.assignToProgram(UniqueId.generate())).toThrow(
      ConflictError,
    );
  });

  it("graduate transitions ACTIVE → GRADUATED", () => {
    const b = Beneficiary.enroll({
      firstName: "Maria",
      lastName: "Garcia",
      location: "Lagos",
    });
    b.graduate();
    expect(b.status).toBe("GRADUATED");
  });

  it("graduate rejects non-ACTIVE", () => {
    const b = Beneficiary.enroll({
      firstName: "Maria",
      lastName: "Garcia",
      location: "Lagos",
    });
    b.deactivate();
    expect(() => b.graduate()).toThrow(ConflictError);
  });

  it("deactivate is idempotent", () => {
    const b = Beneficiary.enroll({
      firstName: "Maria",
      lastName: "Garcia",
      location: "Lagos",
    });
    b.deactivate();
    expect(b.status).toBe("INACTIVE");
    b.deactivate();
    expect(b.status).toBe("INACTIVE");
  });
});
