import { beforeEach, describe, expect, it } from "vitest";
import {
  PaginatedResult,
  PaginationParams,
  buildPaginatedResult,
} from "../../../src/shared/application/PaginatedQuery";
import { Money } from "../../../src/shared/domain/value-objects/Money";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { InMemoryEventBus } from "../../../src/shared/infrastructure/events/InMemoryEventBus";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { Donation } from "../../../src/modules/donation/domain/entities/Donation";
import { CreateDonationIntentUseCase } from "../../../src/modules/donation/application/use-cases/CreateDonationIntentUseCase";
import { NoopPaymentGateway } from "../../../src/modules/donation/infrastructure/adapters/external/NoopPaymentGateway";
import {
  DonationHistoryFilters,
  DonationRepository,
} from "../../../src/modules/donation/domain/ports/outbound/DonationRepository";

const VALID_KEY = "0123456789abcdef0123";

class InMemoryDonationRepository implements DonationRepository {
  private byId = new Map<string, Donation>();
  private byKey = new Map<string, string>();
  saves = 0;

  async save(donation: Donation): Promise<void> {
    this.saves += 1;
    this.byId.set(donation.id.value, donation);
    this.byKey.set(donation.idempotencyKey, donation.id.value);
  }
  async findById(id: UniqueId): Promise<Donation | null> {
    return this.byId.get(id.value) ?? null;
  }
  async findByIdempotencyKey(key: string): Promise<Donation | null> {
    const id = this.byKey.get(key);
    return id ? (this.byId.get(id) ?? null) : null;
  }
  async findByDonor(
    _donorId: UniqueId,
    pagination: PaginationParams,
    _filters?: DonationHistoryFilters,
  ): Promise<PaginatedResult<Donation>> {
    return buildPaginatedResult([], 0, pagination);
  }
  async sumByCampaign(_id: UniqueId): Promise<Money> {
    return Money.zero("USD");
  }
}

describe("CreateDonationIntentUseCase", () => {
  let donations: InMemoryDonationRepository;
  let gateway: NoopPaymentGateway;
  let bus: InMemoryEventBus;
  let useCase: CreateDonationIntentUseCase;

  beforeEach(() => {
    donations = new InMemoryDonationRepository();
    gateway = new NoopPaymentGateway();
    bus = new InMemoryEventBus();
    useCase = new CreateDonationIntentUseCase(donations, gateway, bus);
  });

  it("creates a new donation intent and returns a client secret", async () => {
    const result = await useCase.execute({
      donorEmail: "donor@example.com",
      amountCents: 5_000,
      currency: "USD",
      frequency: "ONE_TIME",
      paymentMethod: "CARD",
      idempotencyKey: VALID_KEY,
    });

    expect(result.reused).toBe(false);
    expect(result.status).toBe("PROCESSING");
    expect(result.clientSecret).toMatch(/^cs_test_/);
    expect(donations.saves).toBe(1);
  });

  it("returns the existing intent when called again with the same idempotency key", async () => {
    const first = await useCase.execute({
      donorEmail: "donor@example.com",
      amountCents: 5_000,
      currency: "USD",
      frequency: "ONE_TIME",
      paymentMethod: "CARD",
      idempotencyKey: VALID_KEY,
    });
    const second = await useCase.execute({
      donorEmail: "donor@example.com",
      amountCents: 5_000,
      currency: "USD",
      frequency: "ONE_TIME",
      paymentMethod: "CARD",
      idempotencyKey: VALID_KEY,
    });

    expect(second.reused).toBe(true);
    expect(second.donationId).toBe(first.donationId);
    expect(second.clientSecret).toBe(first.clientSecret); // gateway is idempotent
    expect(donations.saves).toBe(1); // only the first call persisted
  });

  it("rejects unsupported currencies", async () => {
    await expect(
      useCase.execute({
        donorEmail: "donor@example.com",
        amountCents: 5_000,
        currency: "ZWL",
        frequency: "ONE_TIME",
        paymentMethod: "CARD",
        idempotencyKey: VALID_KEY,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
