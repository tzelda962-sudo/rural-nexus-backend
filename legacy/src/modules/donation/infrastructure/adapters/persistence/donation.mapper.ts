import { Email } from "../../../../../shared/domain/value-objects/Email";
import { Money } from "../../../../../shared/domain/value-objects/Money";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Donation } from "../../../domain/entities/Donation";
import { DonationFrequency } from "../../../domain/value-objects/DonationFrequency";
import { DonationStatus } from "../../../domain/value-objects/DonationStatus";

export interface DonationRow {
  id: string;
  donor_id: string | null;
  donor_email: string;
  amount_cents: string | number;
  currency: string;
  campaign_id: string | null;
  frequency: DonationFrequency;
  status: DonationStatus;
  payment_intent_id: string | null;
  idempotency_key: string;
  metadata: Record<string, string>;
  failure_reason: string | null;
  created_at: Date;
  completed_at: Date | null;
  refunded_at: Date | null;
}

export function donationFromRow(row: DonationRow): Donation {
  return Donation.rehydrate(UniqueId.fromString(row.id), {
    donorId: row.donor_id ? UniqueId.fromString(row.donor_id) : null,
    donorEmail: Email.create(row.donor_email),
    amount: Money.fromCents(Number(row.amount_cents), row.currency),
    campaignId: row.campaign_id ? UniqueId.fromString(row.campaign_id) : null,
    frequency: row.frequency,
    status: row.status,
    paymentIntentId: row.payment_intent_id,
    idempotencyKey: row.idempotency_key,
    metadata: row.metadata ?? {},
    failureReason: row.failure_reason,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    refundedAt: row.refunded_at,
  });
}
