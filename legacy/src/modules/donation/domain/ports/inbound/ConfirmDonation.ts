import { UseCase } from "../../../../../shared/application/UseCase";
import { DonationStatus } from "../../value-objects/DonationStatus";

export interface ConfirmDonationInput {
  donationId: string;
  paymentIntentId: string;
}

export interface ConfirmDonationOutput {
  donationId: string;
  status: DonationStatus;
}

export interface ConfirmDonation
  extends UseCase<ConfirmDonationInput, ConfirmDonationOutput> {}
