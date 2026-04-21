import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../src/shared/domain/errors/ConflictError";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { Money } from "../../../src/shared/domain/value-objects/Money";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { Campaign } from "../../../src/modules/campaign/domain/entities/Campaign";
import { FundingGoal } from "../../../src/modules/campaign/domain/value-objects/FundingGoal";

function makeCampaign(overrides?: {
  goalCents?: number;
  isFlexible?: boolean;
}): Campaign {
  return Campaign.create({
    title: "Clean Water Initiative",
    description: "Providing clean water to rural communities across the region",
    fundingGoal: FundingGoal.create(
      Money.fromCents(overrides?.goalCents ?? 500_000, "USD"),
      overrides?.isFlexible ?? false,
    ),
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-12-31"),
    createdBy: UniqueId.generate(),
    tags: ["water", "health"],
  });
}

describe("Campaign aggregate", () => {
  it("emits CampaignCreated on create with DRAFT status", () => {
    const c = makeCampaign();
    expect(c.status).toBe("DRAFT");
    expect(c.isPublished).toBe(false);
    expect(c.donationCount).toBe(0);
    expect(c.amountRaised.amountCents).toBe(0);
    expect(c.slug.value).toBe("clean-water-initiative");
    expect(c.tags).toEqual(["water", "health"]);

    const events = c.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe("campaign.CampaignCreated");
  });

  it("dedupes and lowercases tags", () => {
    const c = Campaign.create({
      title: "Duplicate Tags Test Campaign",
      description: "Testing that duplicate tags are removed on creation",
      fundingGoal: FundingGoal.create(Money.fromCents(10_000, "USD"), false),
      startDate: new Date("2026-05-01"),
      createdBy: UniqueId.generate(),
      tags: ["Water", "water", "HEALTH", "health"],
    });
    expect(c.tags).toEqual(["water", "health"]);
  });

  it("rejects titles that are too short or too long", () => {
    expect(() =>
      Campaign.create({
        title: "Ab",
        description: "A description that is certainly long enough",
        fundingGoal: FundingGoal.create(Money.fromCents(10_000, "USD"), false),
        startDate: new Date("2026-05-01"),
        createdBy: UniqueId.generate(),
      }),
    ).toThrow(ValidationError);

    expect(() =>
      Campaign.create({
        title: "A".repeat(201),
        description: "A description that is certainly long enough",
        fundingGoal: FundingGoal.create(Money.fromCents(10_000, "USD"), false),
        startDate: new Date("2026-05-01"),
        createdBy: UniqueId.generate(),
      }),
    ).toThrow(ValidationError);
  });

  it("rejects descriptions shorter than 20 chars", () => {
    expect(() =>
      Campaign.create({
        title: "Valid Title Here",
        description: "Too short",
        fundingGoal: FundingGoal.create(Money.fromCents(10_000, "USD"), false),
        startDate: new Date("2026-05-01"),
        createdBy: UniqueId.generate(),
      }),
    ).toThrow(ValidationError);
  });

  it("rejects endDate before startDate", () => {
    expect(() =>
      Campaign.create({
        title: "Valid Title Here",
        description: "A description that is certainly long enough",
        fundingGoal: FundingGoal.create(Money.fromCents(10_000, "USD"), false),
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-04-30"),
        createdBy: UniqueId.generate(),
      }),
    ).toThrow(ValidationError);
  });

  it("publish() transitions DRAFT → ACTIVE and emits CampaignPublished", () => {
    const c = makeCampaign();
    c.pullEvents();
    c.publish();

    expect(c.status).toBe("ACTIVE");
    expect(c.isPublished).toBe(true);
    expect(c.publishedAt).not.toBeNull();

    const events = c.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe("campaign.CampaignPublished");
  });

  it("publish() rejects non-DRAFT campaigns", () => {
    const c = makeCampaign();
    c.publish();
    expect(() => c.publish()).toThrow(ConflictError);
  });

  it("pause() transitions ACTIVE → PAUSED", () => {
    const c = makeCampaign();
    c.publish();
    c.pause();
    expect(c.status).toBe("PAUSED");
  });

  it("pause() rejects non-ACTIVE campaigns", () => {
    const c = makeCampaign();
    expect(() => c.pause()).toThrow(ConflictError);
  });

  it("close() transitions ACTIVE → CLOSED", () => {
    const c = makeCampaign();
    c.publish();
    c.close();
    expect(c.status).toBe("CLOSED");
  });

  it("archive() transitions CLOSED → ARCHIVED", () => {
    const c = makeCampaign();
    c.publish();
    c.close();
    c.archive();
    expect(c.status).toBe("ARCHIVED");
  });

  it("archive() rejects non-CLOSED campaigns", () => {
    const c = makeCampaign();
    c.publish();
    expect(() => c.archive()).toThrow(ConflictError);
  });

  it("recordDonation increments raised amount and count", () => {
    const c = makeCampaign();
    c.publish();
    c.pullEvents();

    c.recordDonation(Money.fromCents(10_000, "USD"));
    expect(c.amountRaised.amountCents).toBe(10_000);
    expect(c.donationCount).toBe(1);

    c.recordDonation(Money.fromCents(5_000, "USD"));
    expect(c.amountRaised.amountCents).toBe(15_000);
    expect(c.donationCount).toBe(2);
  });

  it("recordDonation rejects on non-ACTIVE campaigns", () => {
    const c = makeCampaign();
    expect(() => c.recordDonation(Money.fromCents(1_000, "USD"))).toThrow(
      ConflictError,
    );
  });

  it("recordDonation fires CampaignGoalReached when crossing the goal", () => {
    const c = makeCampaign({ goalCents: 20_000 });
    c.publish();
    c.pullEvents();

    c.recordDonation(Money.fromCents(15_000, "USD"));
    expect(c.pullEvents()).toHaveLength(0);
    expect(c.isGoalReached).toBe(false);

    c.recordDonation(Money.fromCents(5_000, "USD"));
    expect(c.isGoalReached).toBe(true);
    const events = c.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe("campaign.CampaignGoalReached");
  });

  it("does not fire GoalReached on subsequent donations after goal already met", () => {
    const c = makeCampaign({ goalCents: 10_000 });
    c.publish();
    c.pullEvents();

    c.recordDonation(Money.fromCents(10_000, "USD"));
    c.pullEvents(); // consume the GoalReached event

    c.recordDonation(Money.fromCents(5_000, "USD"));
    expect(c.pullEvents()).toHaveLength(0);
  });

  it("progressPercentage is calculated correctly", () => {
    const c = makeCampaign({ goalCents: 100_000 });
    c.publish();
    c.recordDonation(Money.fromCents(25_000, "USD"));
    expect(c.progressPercentage).toBe(25);
  });

  it("progressPercentage caps at 100 for flexible goals", () => {
    const c = makeCampaign({ goalCents: 10_000, isFlexible: true });
    c.publish();
    c.recordDonation(Money.fromCents(15_000, "USD"));
    expect(c.progressPercentage).toBe(100);
  });

  it("updateDetails changes title/slug/description/endDate", () => {
    const c = makeCampaign();
    c.updateDetails({
      title: "Updated Water Project",
      description: "An updated description that is long enough to pass validation",
    });
    expect(c.title).toBe("Updated Water Project");
    expect(c.slug.value).toBe("updated-water-project");
    expect(c.description).toBe(
      "An updated description that is long enough to pass validation",
    );
  });

  it("rehydrate restores state without emitting events", () => {
    const original = makeCampaign();
    original.publish();
    original.pullEvents();

    const rehydrated = Campaign.rehydrate(original.id, {
      title: original.title,
      slug: original.slug,
      description: original.description,
      coverImageUrl: null,
      fundingGoal: original.fundingGoal,
      amountRaised: original.amountRaised,
      donationCount: 0,
      status: "ACTIVE",
      startDate: original.startDate,
      endDate: original.endDate,
      createdBy: original.createdBy,
      tags: original.tags,
      isPublished: true,
      publishedAt: original.publishedAt,
      createdAt: original.createdAt,
      updatedAt: original.updatedAt,
    });

    expect(rehydrated.status).toBe("ACTIVE");
    expect(rehydrated.pullEvents()).toHaveLength(0);
  });
});
