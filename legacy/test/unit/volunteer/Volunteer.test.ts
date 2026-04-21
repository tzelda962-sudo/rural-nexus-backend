import { describe, expect, it } from "vitest";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { Email } from "../../../src/shared/domain/value-objects/Email";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { Volunteer } from "../../../src/modules/volunteer/domain/entities/Volunteer";
import { Availability } from "../../../src/modules/volunteer/domain/value-objects/Availability";
import { Skill } from "../../../src/modules/volunteer/domain/value-objects/Skill";

function makeVolunteer(): Volunteer {
  return Volunteer.register({
    userId: UniqueId.generate(),
    firstName: "Brenda",
    lastName: "Banks",
    email: Email.create("brenda@example.com"),
    skills: [
      Skill.create("First Aid", "INTERMEDIATE"),
      Skill.create("Teaching", "EXPERT"),
    ],
    availability: Availability.create({
      days: ["MON", "WED", "FRI"],
      hoursPerWeek: 12,
      timezone: "Africa/Douala",
      preferRemote: false,
    }),
  });
}

describe("Volunteer aggregate", () => {
  it("emits VolunteerRegistered with PENDING_REVIEW status", () => {
    const v = makeVolunteer();
    expect(v.status).toBe("PENDING_REVIEW");
    expect(v.backgroundCheckStatus).toBe("PENDING");
    expect(v.totalHoursLogged).toBe(0);
    const events = v.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe("volunteer.VolunteerRegistered");
  });

  it("dedupes skills on registration (case-insensitive name + proficiency)", () => {
    const v = Volunteer.register({
      userId: UniqueId.generate(),
      firstName: "Sam",
      lastName: "Smith",
      email: Email.create("sam@example.com"),
      skills: [
        Skill.create("Web Dev", "EXPERT"),
        Skill.create("web dev", "EXPERT"), // duplicate
        Skill.create("Web Dev", "BEGINNER"), // different proficiency, kept
      ],
      availability: Availability.create({
        days: ["SAT"],
        hoursPerWeek: 4,
        timezone: "UTC",
        preferRemote: true,
      }),
    });
    expect(v.skills).toHaveLength(2);
  });

  it("addSkill is idempotent for duplicates and removeSkill drops by name", () => {
    const v = makeVolunteer();
    v.pullEvents();
    v.addSkill(Skill.create("First Aid", "INTERMEDIATE")); // duplicate
    expect(v.skills).toHaveLength(2);

    v.addSkill(Skill.create("Logistics", "BEGINNER"));
    expect(v.skills).toHaveLength(3);

    v.removeSkill("First Aid");
    expect(v.skills).toHaveLength(2);
    expect(v.skills.some((s) => s.name === "First Aid")).toBe(false);
  });

  it("activate moves from PENDING_REVIEW to ACTIVE; cannot activate from SUSPENDED", () => {
    const v = makeVolunteer();
    v.activate();
    expect(v.status).toBe("ACTIVE");

    v.suspend();
    expect(v.status).toBe("SUSPENDED");
    expect(() => v.activate()).toThrow(ValidationError);
  });

  it("logHours accumulates and rejects non-positive values", () => {
    const v = makeVolunteer();
    v.logHours(2.5);
    v.logHours(1.5);
    expect(v.totalHoursLogged).toBeCloseTo(4);

    expect(() => v.logHours(0)).toThrow(ValidationError);
    expect(() => v.logHours(-1)).toThrow(ValidationError);
  });

  it("updateAvailability replaces the value object", () => {
    const v = makeVolunteer();
    v.updateAvailability(
      Availability.create({
        days: ["TUE", "THU"],
        hoursPerWeek: 6,
        timezone: "Africa/Douala",
        preferRemote: true,
      }),
    );
    expect(v.availability.hoursPerWeek).toBe(6);
    expect(v.availability.days).toEqual(["TUE", "THU"]);
    expect(v.availability.preferRemote).toBe(true);
  });

  it("Availability.create rejects invalid day codes and bad hour ranges", () => {
    expect(() =>
      Availability.create({
        days: ["XYZ"],
        hoursPerWeek: 5,
        timezone: "UTC",
        preferRemote: false,
      }),
    ).toThrow(ValidationError);

    expect(() =>
      Availability.create({
        days: ["MON"],
        hoursPerWeek: 0,
        timezone: "UTC",
        preferRemote: false,
      }),
    ).toThrow(ValidationError);
  });
});
