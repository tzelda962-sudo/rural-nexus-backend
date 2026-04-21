import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../src/shared/domain/errors/ConflictError";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { Email } from "../../../src/shared/domain/value-objects/Email";
import { Money } from "../../../src/shared/domain/value-objects/Money";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import {
  Donation,
  MAX_DONATION_CENTS,
  MIN_DONATION_CENTS,
} from "../../../src/modules/donation/domain/entities/Donation";

const VALID_KEY = "abcdefghij1234567890"; // 20 chars

function makeDonation(): Donation {
  return Donation.createIntent({
    donorEmail: Email.create("donor@example.com"),
    amount: Money.fromCents(5_000, "USD"),
    frequency: "ONE_TIME",
    idempotencyKey: VALID_KEY,
  });
}

describe("Donation aggregate", () => {
  it("emits DonationCreated on createIntent", () => {
    const d = makeDonation();
    const events = d.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe("donation.DonationCreated");
    expect(d.status).toBe("INTENT_CREATED");
  });

  it("rejects amounts below the minimum", () => {
    expect(() =>
      Donation.createIntent({
        donorEmail: Email.create("donor@example.com"),
        amount: Money.fromCents(MIN_DONATION_CENTS - 1, "USD"),
        frequency: "ONE_TIME",
        idempotencyKey: VALID_KEY,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects amounts above the maximum", () => {
    expect(() =>
      Donation.createIntent({
        donorEmail: Email.create("donor@example.com"),
        amount: Money.fromCents(MAX_DONATION_CENTS + 1, "USD"),
        frequency: "ONE_TIME",
        idempotencyKey: VALID_KEY,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects an idempotency key that is too short", () => {
    expect(() =>
      Donation.createIntent({
        donorEmail: Email.create("donor@example.com"),
        amount: Money.fromCents(5_000, "USD"),
        frequency: "ONE_TIME",
        idempotencyKey: "short",
      }),
    ).toThrow(ValidationError);
  });

  it("transitions INTENT_CREATED -> PROCESSING when intent is attached", () => {
    const d = makeDonation();
    d.attachPaymentIntent("pi_123");
    expect(d.status).toBe("PROCESSING");
    expect(d.paymentIntentId).toBe("pi_123");
  });

  it("confirm() completes the donation and emits DonationCompleted", () => {
    const d = makeDonation();
    d.pullEvents();
    d.attachPaymentIntent("pi_123");
    d.confirm("pi_123");

    expect(d.status).toBe("COMPLETED");
    expect(d.completedAt).not.toBeNull();
    const events = d.pullEvents();
    expect(events.map((e) => e.eventType)).toContain(
      "donation.DonationCompleted",
    );
  });

  it("confirm() is idempotent on COMPLETED", () => {
    const d = makeDonation();
    d.confirm("pi_123");
    d.pullEvents();
    d.confirm("pi_123"); // second call: noop, no new event
    expect(d.pullEvents()).toHaveLength(0);
    expect(d.status).toBe("COMPLETED");
  });

  it("confirm() rejects mismatched payment intent IDs", () => {
    const d = makeDonation();
    d.attachPaymentIntent("pi_123");
    expect(() => d.confirm("pi_DIFFERENT")).toThrow(ConflictError);
  });

  it("fail() moves the donation to FAILED with a reason", () => {
    const d = makeDonation();
    d.pullEvents();
    d.fail("card declined");
    expect(d.status).toBe("FAILED");
    expect(d.failureReason).toBe("card declined");
    expect(d.pullEvents()[0]?.eventType).toBe("donation.DonationFailed");
  });

  it("fail() cannot be called on a COMPLETED donation", () => {
    const d = makeDonation();
    d.confirm("pi_123");
    expect(() => d.fail("nope")).toThrow(ConflictError);
  });

  it("refund() only works on COMPLETED donations", () => {
    const d = makeDonation();
    expect(() => d.refund()).toThrow(ConflictError);

    d.confirm("pi_123");
    d.pullEvents();
    d.refund();
    expect(d.status).toBe("REFUNDED");
    expect(d.refundedAt).not.toBeNull();
    expect(d.pullEvents()[0]?.eventType).toBe("donation.DonationRefunded");
  });

  it("isRecurring is true for non-ONE_TIME frequencies", () => {
    const monthly = Donation.createIntent({
      donorEmail: Email.create("donor@example.com"),
      amount: Money.fromCents(2_500, "USD"),
      frequency: "MONTHLY",
      idempotencyKey: VALID_KEY,
    });
    expect(monthly.isRecurring).toBe(true);

    const oneTime = makeDonation();
    expect(oneTime.isRecurring).toBe(false);
  });

  it("rehydrate restores state without emitting events", () => {
    const id = UniqueId.generate();
    const d = Donation.rehydrate(id, {
      donorId: null,
      donorEmail: Email.create("donor@example.com"),
      amount: Money.fromCents(10_000, "USD"),
      campaignId: null,
      frequency: "ONE_TIME",
      status: "COMPLETED",
      paymentIntentId: "pi_x",
      idempotencyKey: VALID_KEY,
      metadata: {},
      failureReason: null,
      createdAt: new Date(),
      completedAt: new Date(),
      refundedAt: null,
    });
    expect(d.status).toBe("COMPLETED");
    expect(d.pullEvents()).toHaveLength(0);
  });
});
