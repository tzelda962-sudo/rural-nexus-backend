import { UseCase } from "../../../../../shared/application/UseCase";
import { DonationFrequency } from "../../value-objects/DonationFrequency";
import { DonationStatus } from "../../value-objects/DonationStatus";
import { PaymentMethod } from "../../value-objects/PaymentMethod";

export interface CreateDonationIntentInput {
  donorId?: string;
  donorEmail: string;
  amountCents: number;
  currency: string;
  frequency: DonationFrequency;
  campaignId?: string;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface CreateDonationIntentOutput {
  donationId: string;
  clientSecret: string;
  status: DonationStatus;
  reused: boolean;
}

export interface CreateDonationIntent
  extends UseCase<CreateDonationIntentInput, CreateDonationIntentOutput> {}
