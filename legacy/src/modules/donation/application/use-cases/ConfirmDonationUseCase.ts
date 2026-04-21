import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  ConfirmDonation,
  ConfirmDonationInput,
  ConfirmDonationOutput,
} from "../../domain/ports/inbound/ConfirmDonation";
import { DonationRepository } from "../../domain/ports/outbound/DonationRepository";
import { PaymentGateway } from "../../domain/ports/outbound/PaymentGateway";

export class ConfirmDonationUseCase implements ConfirmDonation {
  constructor(
    private readonly donations: DonationRepository,
    private readonly gateway: PaymentGateway,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: ConfirmDonationInput): Promise<ConfirmDonationOutput> {
    const donation = await this.donations.findById(
      UniqueId.fromString(input.donationId),
    );
    if (!donation) {
      throw new NotFoundError("Donation", input.donationId);
    }

    const status = await this.gateway.confirmPayment(input.paymentIntentId);
    if (status.status === "succeeded") {
      donation.confirm(input.paymentIntentId);
    } else if (status.status === "failed" || status.status === "canceled") {
      donation.fail(`gateway status: ${status.status}`);
    }
    // For "processing" or "requires_action" we leave the donation in PROCESSING.

    await this.donations.save(donation);
    await this.eventBus.publishAll(donation.pullEvents());

    return { donationId: donation.id.value, status: donation.status };
  }
}
