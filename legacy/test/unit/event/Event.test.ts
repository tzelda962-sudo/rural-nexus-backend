import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../src/shared/domain/errors/ConflictError";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { Event } from "../../../src/modules/event/domain/entities/Event";
import { EventLocation } from "../../../src/modules/event/domain/value-objects/EventLocation";

const tomorrow = new Date(Date.now() + 86_400_000);
const dayAfter = new Date(Date.now() + 172_800_000);

function makeLocation(overrides?: Partial<Parameters<typeof EventLocation.create>[0]>) {
  return EventLocation.create({
    venue: "Community Hall",
    address: "123 Main St, Lagos",
    coordinates: null,
    isVirtual: false,
    virtualLink: null,
    ...overrides,
  });
}

function makeEvent(
  overrides?: Partial<Parameters<typeof Event.create>[0]>,
): Event {
  return Event.create({
    title: "Annual Fundraiser Gala",
    description: "Join us for an evening of charity and celebration",
    type: "FUNDRAISER",
    location: makeLocation(),
    startDate: tomorrow,
    endDate: dayAfter,
    createdBy: UniqueId.generate(),
    ...overrides,
  });
}

describe("Event aggregate", () => {
  it("creates with DRAFT status", () => {
    const e = makeEvent();
    expect(e.status).toBe("DRAFT");
    expect(e.registrationCount).toBe(0);
    expect(e.isFull).toBe(false);
    expect(e.slug.value).toContain("annual-fundraiser-gala");
  });

  it("rejects short title", () => {
    expect(() => makeEvent({ title: "Hi" })).toThrow(ValidationError);
  });

  it("rejects short description", () => {
    expect(() => makeEvent({ description: "Too short" })).toThrow(
      ValidationError,
    );
  });

  it("rejects endDate <= startDate", () => {
    const start = new Date("2026-06-01");
    const end = new Date("2026-05-31");
    expect(() => makeEvent({ startDate: start, endDate: end })).toThrow(
      ValidationError,
    );
  });

  it("rejects maxAttendees < 1", () => {
    expect(() => makeEvent({ maxAttendees: 0 })).toThrow(ValidationError);
  });

  // ── State transitions ──────────────────────────────

  it("publish transitions DRAFT → PUBLISHED", () => {
    const e = makeEvent();
    e.publish();
    expect(e.status).toBe("PUBLISHED");
    const events = e.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.eventType).toBe("event.EventPublished");
  });

  it("publish rejects non-DRAFT", () => {
    const e = makeEvent();
    e.publish();
    expect(() => e.publish()).toThrow(ConflictError);
  });

  it("cancel transitions PUBLISHED → CANCELLED", () => {
    const e = makeEvent();
    e.publish();
    e.pullEvents();
    e.cancel("Weather emergency");
    expect(e.status).toBe("CANCELLED");
    const events = e.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.eventType).toBe("event.EventCancelled");
    expect(events[0]!.payload.reason).toBe("Weather emergency");
  });

  it("cancel rejects empty reason", () => {
    const e = makeEvent();
    e.publish();
    expect(() => e.cancel("")).toThrow(ValidationError);
  });

  it("cancel rejects non-PUBLISHED", () => {
    const e = makeEvent();
    expect(() => e.cancel("reason")).toThrow(ConflictError);
  });

  it("complete transitions PUBLISHED → COMPLETED", () => {
    const e = makeEvent();
    e.publish();
    e.complete();
    expect(e.status).toBe("COMPLETED");
  });

  // ── Registration ──────────────────────────────

  it("registerAttendee increments count and fires event", () => {
    const e = makeEvent({ maxAttendees: 5 });
    e.publish();
    e.pullEvents();

    const reg = e.registerAttendee(UniqueId.generate());
    expect(e.registrationCount).toBe(1);
    expect(e.availableSlots).toBe(4);
    expect(reg.isCancelled).toBe(false);

    const events = e.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.eventType).toBe("event.AttendeeRegistered");
  });

  it("registerAttendee rejects when full", () => {
    const e = makeEvent({ maxAttendees: 1 });
    e.publish();
    e.registerAttendee(UniqueId.generate());
    expect(e.isFull).toBe(true);
    expect(() => e.registerAttendee(UniqueId.generate())).toThrow(
      ConflictError,
    );
  });

  it("registerAttendee rejects on non-PUBLISHED event", () => {
    const e = makeEvent();
    expect(() => e.registerAttendee(UniqueId.generate())).toThrow(
      ConflictError,
    );
  });

  it("unlimited capacity never reports full", () => {
    const e = makeEvent({ maxAttendees: null });
    e.publish();
    for (let i = 0; i < 100; i++) {
      e.registerAttendee(UniqueId.generate());
    }
    expect(e.isFull).toBe(false);
    expect(e.availableSlots).toBeNull();
    expect(e.registrationCount).toBe(100);
  });

  it("decrementRegistration reduces count", () => {
    const e = makeEvent({ maxAttendees: 5 });
    e.publish();
    e.registerAttendee(UniqueId.generate());
    expect(e.registrationCount).toBe(1);
    e.decrementRegistration();
    expect(e.registrationCount).toBe(0);
  });

  it("decrementRegistration does not go below zero", () => {
    const e = makeEvent();
    e.decrementRegistration();
    expect(e.registrationCount).toBe(0);
  });
});

describe("EventLocation value object", () => {
  it("creates valid location", () => {
    const loc = makeLocation();
    expect(loc.venue).toBe("Community Hall");
    expect(loc.isVirtual).toBe(false);
  });

  it("rejects empty venue", () => {
    expect(() => makeLocation({ venue: "" })).toThrow(ValidationError);
  });

  it("rejects empty address", () => {
    expect(() => makeLocation({ address: "" })).toThrow(ValidationError);
  });

  it("rejects virtual event without link", () => {
    expect(() =>
      makeLocation({ isVirtual: true, virtualLink: null }),
    ).toThrow(ValidationError);
  });

  it("accepts virtual event with link", () => {
    const loc = makeLocation({
      isVirtual: true,
      virtualLink: "https://zoom.us/j/123",
    });
    expect(loc.isVirtual).toBe(true);
    expect(loc.virtualLink).toBe("https://zoom.us/j/123");
  });

  it("validates coordinate ranges", () => {
    expect(() =>
      makeLocation({ coordinates: { lat: 91, lng: 0 } }),
    ).toThrow(ValidationError);
    expect(() =>
      makeLocation({ coordinates: { lat: 0, lng: 181 } }),
    ).toThrow(ValidationError);
  });

  it("accepts valid coordinates", () => {
    const loc = makeLocation({
      coordinates: { lat: 6.5244, lng: 3.3792 },
    });
    expect(loc.coordinates).toEqual({ lat: 6.5244, lng: 3.3792 });
  });
});

describe("EventRegistration entity", () => {
  it("creates and cancels", () => {
    const e = makeEvent({ maxAttendees: 10 });
    e.publish();
    const reg = e.registerAttendee(UniqueId.generate());
    expect(reg.isCancelled).toBe(false);
    reg.cancel();
    expect(reg.isCancelled).toBe(true);
    expect(reg.cancelledAt).toBeInstanceOf(Date);
  });
});
