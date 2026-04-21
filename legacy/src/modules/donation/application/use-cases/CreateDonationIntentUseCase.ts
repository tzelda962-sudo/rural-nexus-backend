import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import { Email } from "../../../../shared/domain/value-objects/Email";
import { Money } from "../../../../shared/domain/value-objects/Money";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { Donation } from "../../domain/entities/Donation";
import {
  CreateDonationIntent,
  CreateDonationIntentInput,
  CreateDonationIntentOutput,
} from "../../domain/ports/inbound/CreateDonationIntent";
import { DonationRepository } from "../../domain/ports/outbound/DonationRepository";
import { PaymentGateway } from "../../domain/ports/outbound/PaymentGateway";

const ALLOWED_CURRENCIES = new Set(["USD", "EUR", "GBP", "CAD", "XAF"]);

export class CreateDonationIntentUseCase implements CreateDonationIntent {
  constructor(
    private readonly donations: DonationRepository,
    private readonly gateway: PaymentGateway,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    input: CreateDonationIntentInput,
  ): Promise<CreateDonationIntentOutput> {
    if (!ALLOWED_CURRENCIES.has(input.currency.toUpperCase())) {
      throw new ValidationError(
        `Unsupported currency: ${input.currency}`,
        { allowed: Array.from(ALLOWED_CURRENCIES) },
      );
    }

    // Idempotency: replay-safe — if we've seen this key, return the existing intent.
    const existing = await this.donations.findByIdempotencyKey(
      input.idempotencyKey,
    );
    if (existing) {
      // Re-issuing a client secret requires the gateway record to still be valid.
      // For replay we trust the persisted paymentIntentId; the gateway side is
      // safe because Stripe's idempotencyKey returns the same intent.
      const replay = await this.gateway.createPaymentIntent({
        amountCents: existing.amount.amountCents,
        currency: existing.amount.currency,
        donorEmail: existing.donorEmail.value,
        metadata: {
          donationId: existing.id.value,
          ...existing.metadata,
        },
        idempotencyKey: existing.idempotencyKey,
      });
      return {
        donationId: existing.id.value,
        clientSecret: replay.clientSecret,
        status: existing.status,
        reused: true,
      };
    }

    const donorEmail = Email.create(input.donorEmail);
    const amount = Money.fromCents(input.amountCents, input.currency);
    const donorId = input.donorId
      ? UniqueId.fromString(input.donorId)
      : null;
    const campaignId = input.campaignId
      ? UniqueId.fromString(input.campaignId)
      : undefined;

    const donation = Donation.createIntent({
      donorId,
      donorEmail,
      amount,
      frequency: input.frequency,
      campaignId,
      idempotencyKey: input.idempotencyKey,
      metadata: {
        ...(input.metadata ?? {}),
        paymentMethod: input.paymentMethod,
      },
    });

    const intent = await this.gateway.createPaymentIntent({
      amountCents: amount.amountCents,
      currency: amount.currency,
      donorEmail: donorEmail.value,
      metadata: {
        donationId: donation.id.value,
        ...donation.metadata,
      },
      idempotencyKey: donation.idempotencyKey,
    });

    donation.attachPaymentIntent(intent.paymentIntentId);
    await this.donations.save(donation);
    await this.eventBus.publishAll(donation.pullEvents());

    return {
      donationId: donation.id.value,
      clientSecret: intent.clientSecret,
      status: donation.status,
      reused: false,
    };
  }
}
