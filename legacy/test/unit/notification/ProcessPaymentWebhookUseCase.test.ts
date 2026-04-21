import { beforeEach, describe, expect, it } from "vitest";
import {
  PaginatedResult,
  PaginationParams,
  buildPaginatedResult,
} from "../../../src/shared/application/PaginatedQuery";
import { Money } from "../../../src/shared/domain/value-objects/Money";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { Email } from "../../../src/shared/domain/value-objects/Email";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";
import { InMemoryEventBus } from "../../../src/shared/infrastructure/events/InMemoryEventBus";
import { Donation } from "../../../src/modules/donation/domain/entities/Donation";
import {
  DonationHistoryFilters,
  DonationRepository,
} from "../../../src/modules/donation/domain/ports/outbound/DonationRepository";
import {
  ProcessPaymentWebhookUseCase,
  WebhookSignatureVerifier,
} from "../../../src/modules/notification/application/use-cases/ProcessPaymentWebhookUseCase";
import {
  ProcessedWebhookRepository,
  ProcessedWebhookResult,
} from "../../../src/modules/notification/domain/ports/outbound/ProcessedWebhookRepository";

class InMemoryProcessedWebhookRepository
  implements ProcessedWebhookRepository
{
  private store = new Map<string, ProcessedWebhookResult>();

  async findByKey(key: string): Promise<ProcessedWebhookResult | null> {
    return this.store.get(key) ?? null;
  }

  async save(params: {
    idempotencyKey: string;
    provider: string;
    eventType: string;
    result: ProcessedWebhookResult;
  }): Promise<void> {
    this.store.set(params.idempotencyKey, params.result);
  }
}

class InMemoryDonationRepository implements DonationRepository {
  private byId = new Map<string, Donation>();
  saves = 0;

  seed(donation: Donation): void {
    this.byId.set(donation.id.value, donation);
  }

  async save(d: Donation): Promise<void> {
    this.saves += 1;
    this.byId.set(d.id.value, d);
  }
  async findById(id: UniqueId): Promise<Donation | null> {
    return this.byId.get(id.value) ?? null;
  }
  async findByIdempotencyKey(_key: string): Promise<Donation | null> {
    return null;
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

class AlwaysValidVerifier implements WebhookSignatureVerifier {
  verify(): boolean {
    return true;
  }
}

class AlwaysInvalidVerifier implements WebhookSignatureVerifier {
  verify(): boolean {
    return false;
  }
}

function makeDonation(): Donation {
  return Donation.createIntent({
    donorEmail: Email.create("donor@example.com"),
    amount: Money.fromCents(5000, "USD"),
    frequency: "ONE_TIME",
    idempotencyKey: "abcdefghij1234567890",
  });
}

describe("ProcessPaymentWebhookUseCase", () => {
  let webhooks: InMemoryProcessedWebhookRepository;
  let donations: InMemoryDonationRepository;
  let bus: InMemoryEventBus;

  beforeEach(() => {
    webhooks = new InMemoryProcessedWebhookRepository();
    donations = new InMemoryDonationRepository();
    bus = new InMemoryEventBus();
  });

  it("rejects invalid signature", async () => {
    const useCase = new ProcessPaymentWebhookUseCase(
      webhooks,
      donations,
      bus,
      new AlwaysInvalidVerifier(),
    );

    await expect(
      useCase.execute({
        provider: "stripe",
        eventType: "payment_intent.succeeded",
        payload: { id: "evt_1" },
        signature: "bad_sig",
        idempotencyKey: "evt_1",
        receivedAt: new Date(),
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("returns cached result for duplicate webhook", async () => {
    const useCase = new ProcessPaymentWebhookUseCase(
      webhooks,
      donations,
      bus,
      new AlwaysValidVerifier(),
    );

    const donation = makeDonation();
    donation.attachPaymentIntent("pi_123");
    donations.seed(donation);

    const first = await useCase.execute({
      provider: "stripe",
      eventType: "payment_intent.succeeded",
      payload: {
        id: "pi_123",
        metadata: { donationId: donation.id.value },
      },
      signature: "sig_valid",
      idempotencyKey: "evt_unique_1",
      receivedAt: new Date(),
    });
    expect(first.processed).toBe(true);
    expect(first.action).toBe("donation_confirmed");

    const savesAfterFirst = donations.saves;

    const second = await useCase.execute({
      provider: "stripe",
      eventType: "payment_intent.succeeded",
      payload: {
        id: "pi_123",
        metadata: { donationId: donation.id.value },
      },
      signature: "sig_valid",
      idempotencyKey: "evt_unique_1",
      receivedAt: new Date(),
    });
    expect(second).toEqual(first);
    expect(donations.saves).toBe(savesAfterFirst);
  });

  it("confirms donation on payment_intent.succeeded", async () => {
    const useCase = new ProcessPaymentWebhookUseCase(
      webhooks,
      donations,
      bus,
      new AlwaysValidVerifier(),
    );

    const donation = makeDonation();
    donation.attachPaymentIntent("pi_456");
    donations.seed(donation);

    const result = await useCase.execute({
      provider: "stripe",
      eventType: "payment_intent.succeeded",
      payload: {
        id: "pi_456",
        metadata: { donationId: donation.id.value },
      },
      signature: "sig",
      idempotencyKey: "evt_2",
      receivedAt: new Date(),
    });

    expect(result.processed).toBe(true);
    expect(result.action).toBe("donation_confirmed");

    const updated = await donations.findById(donation.id);
    expect(updated?.status).toBe("COMPLETED");
  });

  it("fails donation on payment_intent.payment_failed", async () => {
    const useCase = new ProcessPaymentWebhookUseCase(
      webhooks,
      donations,
      bus,
      new AlwaysValidVerifier(),
    );

    const donation = makeDonation();
    donations.seed(donation);

    const result = await useCase.execute({
      provider: "stripe",
      eventType: "payment_intent.payment_failed",
      payload: {
        id: "pi_789",
        metadata: { donationId: donation.id.value },
        last_payment_error: { message: "Card declined" },
      },
      signature: "sig",
      idempotencyKey: "evt_3",
      receivedAt: new Date(),
    });

    expect(result.processed).toBe(true);
    expect(result.action).toBe("donation_failed");

    const updated = await donations.findById(donation.id);
    expect(updated?.status).toBe("FAILED");
  });

  it("returns unhandled for unknown event types", async () => {
    const useCase = new ProcessPaymentWebhookUseCase(
      webhooks,
      donations,
      bus,
      new AlwaysValidVerifier(),
    );

    const result = await useCase.execute({
      provider: "stripe",
      eventType: "charge.refunded",
      payload: { id: "ch_1" },
      signature: "sig",
      idempotencyKey: "evt_4",
      receivedAt: new Date(),
    });

    expect(result.processed).toBe(false);
    expect(result.action).toBe("unhandled_event:charge.refunded");
  });
});
