import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  ProcessWebhook,
  ProcessWebhookInput,
  ProcessWebhookOutput,
} from "../../domain/ports/inbound/ProcessWebhook";
import { ProcessedWebhookRepository } from "../../domain/ports/outbound/ProcessedWebhookRepository";
import { DonationRepository } from "../../../donation/domain/ports/outbound/DonationRepository";

export interface WebhookSignatureVerifier {
  verify(provider: string, payload: string, signature: string): boolean;
}

export class ProcessPaymentWebhookUseCase implements ProcessWebhook {
  constructor(
    private readonly processedWebhooks: ProcessedWebhookRepository,
    private readonly donations: DonationRepository,
    private readonly eventBus: EventBus,
    private readonly signatureVerifier: WebhookSignatureVerifier,
  ) {}

  async execute(input: ProcessWebhookInput): Promise<ProcessWebhookOutput> {
    // Verify webhook signature
    const isValid = this.signatureVerifier.verify(
      input.provider,
      JSON.stringify(input.payload),
      input.signature,
    );
    if (!isValid) {
      throw new ValidationError("Invalid webhook signature");
    }

    // Idempotency check
    const existing = await this.processedWebhooks.findByKey(
      input.idempotencyKey,
    );
    if (existing) {
      return existing;
    }

    const result = await this.processEvent(input);

    await this.processedWebhooks.save({
      idempotencyKey: input.idempotencyKey,
      provider: input.provider,
      eventType: input.eventType,
      result,
    });

    return result;
  }

  private async processEvent(
    input: ProcessWebhookInput,
  ): Promise<ProcessWebhookOutput> {
    switch (input.eventType) {
      case "payment_intent.succeeded": {
        const paymentIntentId = input.payload.id as string | undefined;
        const donationId = (
          input.payload.metadata as Record<string, string> | undefined
        )?.donationId;
        if (!paymentIntentId || !donationId) {
          return { processed: false, action: "missing_metadata" };
        }

        const donation = await this.donations.findById(
          UniqueId.fromString(donationId),
        );
        if (!donation) {
          return { processed: false, action: "donation_not_found" };
        }

        donation.confirm(paymentIntentId);
        await this.donations.save(donation);
        await this.eventBus.publishAll(donation.pullEvents());
        return { processed: true, action: "donation_confirmed" };
      }

      case "payment_intent.payment_failed": {
        const donationId = (
          input.payload.metadata as Record<string, string> | undefined
        )?.donationId;
        if (!donationId) {
          return { processed: false, action: "missing_metadata" };
        }

        const donation = await this.donations.findById(
          UniqueId.fromString(donationId),
        );
        if (!donation) {
          return { processed: false, action: "donation_not_found" };
        }

        const reason =
          (input.payload.last_payment_error as Record<string, string>)
            ?.message ?? "Payment failed";
        donation.fail(reason);
        await this.donations.save(donation);
        await this.eventBus.publishAll(donation.pullEvents());
        return { processed: true, action: "donation_failed" };
      }

      default:
        return { processed: false, action: `unhandled_event:${input.eventType}` };
    }
  }
}
