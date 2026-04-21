import { UseCase } from "../../../../../shared/application/UseCase";
import { DonationStatus } from "../../value-objects/DonationStatus";

export interface RefundDonationInput {
  donationId: string;
  actorUserId: string;
}

export interface RefundDonationOutput {
  donationId: string;
  status: DonationStatus;
}

export interface RefundDonation
  extends UseCase<RefundDonationInput, RefundDonationOutput> {}
