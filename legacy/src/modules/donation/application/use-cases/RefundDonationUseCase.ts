import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  RefundDonation,
  RefundDonationInput,
  RefundDonationOutput,
} from "../../domain/ports/inbound/RefundDonation";
import { DonationRepository } from "../../domain/ports/outbound/DonationRepository";
import { PaymentGateway } from "../../domain/ports/outbound/PaymentGateway";

export class RefundDonationUseCase implements RefundDonation {
  constructor(
    private readonly donations: DonationRepository,
    private readonly gateway: PaymentGateway,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: RefundDonationInput): Promise<RefundDonationOutput> {
    const donation = await this.donations.findById(
      UniqueId.fromString(input.donationId),
    );
    if (!donation) {
      throw new NotFoundError("Donation", input.donationId);
    }
    if (!donation.paymentIntentId) {
      throw new ValidationError(
        "Donation has no payment intent — nothing to refund",
      );
    }

    await this.gateway.refundPayment(donation.paymentIntentId);
    donation.refund();
    await this.donations.save(donation);
    await this.eventBus.publishAll(donation.pullEvents());

    return { donationId: donation.id.value, status: donation.status };
  }
}
