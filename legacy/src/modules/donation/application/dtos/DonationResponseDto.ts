import { Donation } from "../../domain/entities/Donation";
import { DonationFrequency } from "../../domain/value-objects/DonationFrequency";
import { DonationStatus } from "../../domain/value-objects/DonationStatus";

export interface DonationResponseDto {
  id: string;
  donorId: string | null;
  donorEmail: string;
  amountCents: number;
  currency: string;
  campaignId: string | null;
  frequency: DonationFrequency;
  status: DonationStatus;
  paymentIntentId: string | null;
  createdAt: string;
  completedAt: string | null;
  refundedAt: string | null;
}

export function toDonationResponseDto(donation: Donation): DonationResponseDto {
  return {
    id: donation.id.value,
    donorId: donation.donorId?.value ?? null,
    donorEmail: donation.donorEmail.value,
    amountCents: donation.amount.amountCents,
    currency: donation.amount.currency,
    campaignId: donation.campaignId?.value ?? null,
    frequency: donation.frequency,
    status: donation.status,
    paymentIntentId: donation.paymentIntentId,
    createdAt: donation.createdAt.toISOString(),
    completedAt: donation.completedAt?.toISOString() ?? null,
    refundedAt: donation.refundedAt?.toISOString() ?? null,
  };
}
