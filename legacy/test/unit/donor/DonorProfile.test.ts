import { describe, expect, it } from "vitest";
import { Money } from "../../../src/shared/domain/value-objects/Money";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { DonorProfile } from "../../../src/modules/donor/domain/entities/DonorProfile";

function makeProfile(currency = "USD"): DonorProfile {
  return DonorProfile.create(UniqueId.generate(), currency);
}

describe("DonorProfile aggregate", () => {
  it("creates with BRONZE tier and zero totals", () => {
    const p = makeProfile();
    expect(p.tier).toBe("BRONZE");
    expect(p.totalDonatedAllTime.amountCents).toBe(0);
    expect(p.donationCount).toBe(0);
    expect(p.firstDonationAt).toBeNull();
    expect(p.lastDonationAt).toBeNull();
    expect(p.isAnonymousPreferred).toBe(false);
    expect(p.communicationPreferences).toEqual({
      receiveNewsletter: true,
      receiveUpdates: true,
      preferredChannel: "EMAIL",
    });
  });

  it("stays BRONZE below $500", () => {
    const p = makeProfile();
    p.recordDonation(Money.fromCents(49_999, "USD"));
    expect(p.tier).toBe("BRONZE");
    expect(p.donationCount).toBe(1);
    expect(p.firstDonationAt).toBeInstanceOf(Date);
    expect(p.lastDonationAt).toBeInstanceOf(Date);
  });

  it("promotes to SILVER at $500", () => {
    const p = makeProfile();
    p.recordDonation(Money.fromCents(50_000, "USD"));
    expect(p.tier).toBe("SILVER");
  });

  it("promotes to GOLD at $2,000", () => {
    const p = makeProfile();
    p.recordDonation(Money.fromCents(200_000, "USD"));
    expect(p.tier).toBe("GOLD");
  });

  it("promotes to PATRON at $10,000", () => {
    const p = makeProfile();
    p.recordDonation(Money.fromCents(1_000_000, "USD"));
    expect(p.tier).toBe("PATRON");
  });

  it("accumulates multiple donations and recalculates tier", () => {
    const p = makeProfile();
    p.recordDonation(Money.fromCents(30_000, "USD"));
    expect(p.tier).toBe("BRONZE");

    p.recordDonation(Money.fromCents(25_000, "USD"));
    expect(p.tier).toBe("SILVER");
    expect(p.totalDonatedAllTime.amountCents).toBe(55_000);
    expect(p.donationCount).toBe(2);
  });

  it("updateCommunicationPreferences merges partial updates", () => {
    const p = makeProfile();
    p.updateCommunicationPreferences({ receiveNewsletter: false });
    expect(p.communicationPreferences).toEqual({
      receiveNewsletter: false,
      receiveUpdates: true,
      preferredChannel: "EMAIL",
    });
  });

  it("setAnonymous toggles preference", () => {
    const p = makeProfile();
    p.setAnonymous(true);
    expect(p.isAnonymousPreferred).toBe(true);
    p.setAnonymous(false);
    expect(p.isAnonymousPreferred).toBe(false);
  });

  it("rehydrate restores state without events", () => {
    const id = UniqueId.generate();
    const p = DonorProfile.rehydrate(id, {
      userId: UniqueId.generate(),
      tier: "GOLD",
      totalDonatedAllTime: Money.fromCents(300_000, "USD"),
      donationCount: 15,
      firstDonationAt: new Date("2025-01-01"),
      lastDonationAt: new Date("2026-03-01"),
      isAnonymousPreferred: true,
      communicationPreferences: {
        receiveNewsletter: false,
        receiveUpdates: true,
        preferredChannel: "SMS",
      },
      updatedAt: new Date(),
    });
    expect(p.tier).toBe("GOLD");
    expect(p.pullEvents()).toHaveLength(0);
  });
});
