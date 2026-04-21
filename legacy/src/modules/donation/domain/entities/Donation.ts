import { AggregateRoot } from "../../../../shared/domain/AggregateRoot";
import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { Email } from "../../../../shared/domain/value-objects/Email";
import { Money } from "../../../../shared/domain/value-objects/Money";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { donationCompleted } from "../events/DonationCompleted";
import { donationCreated } from "../events/DonationCreated";
import { donationFailed } from "../events/DonationFailed";
import { donationRefunded } from "../events/DonationRefunded";
import {
  DonationFrequency,
  isRecurringFrequency,
} from "../value-objects/DonationFrequency";
import { DonationStatus } from "../value-objects/DonationStatus";

export const MIN_DONATION_CENTS = 100; // $1.00 minimum
export const MAX_DONATION_CENTS = 100_000_000; // $1M cap

export interface DonationProps {
  donorId: UniqueId | null;
  donorEmail: Email;
  amount: Money;
  campaignId: UniqueId | null;
  frequency: DonationFrequency;
  status: DonationStatus;
  paymentIntentId: string | null;
  idempotencyKey: string;
  metadata: Record<string, string>;
  failureReason: string | null;
  createdAt: Date;
  completedAt: Date | null;
  refundedAt: Date | null;
}

export class Donation extends AggregateRoot<DonationProps> {
  static createIntent(params: {
    id?: UniqueId;
    donorId?: UniqueId | null;
    donorEmail: Email;
    amount: Money;
    frequency: DonationFrequency;
    campaignId?: UniqueId;
    idempotencyKey: string;
    metadata?: Record<string, string>;
  }): Donation {
    if (params.amount.amountCents < MIN_DONATION_CENTS) {
      throw new ValidationError(
        `Donation amount must be at least ${MIN_DONATION_CENTS} cents`,
      );
    }
    if (params.amount.amountCents > MAX_DONATION_CENTS) {
      throw new ValidationError(
        `Donation amount exceeds maximum of ${MAX_DONATION_CENTS} cents`,
      );
    }
    if (
      typeof params.idempotencyKey !== "string" ||
      params.idempotencyKey.length < 16 ||
      params.idempotencyKey.length > 64
    ) {
      throw new ValidationError(
        "idempotencyKey must be 16–64 characters long",
      );
    }

    const now = new Date();
    const donation = new Donation(params.id ?? UniqueId.generate(), {
      donorId: params.donorId ?? null,
      donorEmail: params.donorEmail,
      amount: params.amount,
      campaignId: params.campaignId ?? null,
      frequency: params.frequency,
      status: "INTENT_CREATED",
      paymentIntentId: null,
      idempotencyKey: params.idempotencyKey,
      metadata: params.metadata ?? {},
      failureReason: null,
      createdAt: now,
      completedAt: null,
      refundedAt: null,
    });

    donation.addDomainEvent(
      donationCreated({
        donationId: donation.id.value,
        donorEmail: params.donorEmail.value,
        amountCents: params.amount.amountCents,
        currency: params.amount.currency,
        frequency: params.frequency,
        campaignId: params.campaignId?.value ?? null,
      }),
    );

    return donation;
  }

  static rehydrate(id: UniqueId, props: DonationProps): Donation {
    return new Donation(id, props);
  }

  // ── accessors ─────────────────────────────────────
  get donorId(): UniqueId | null {
    return this.props.donorId;
  }
  get donorEmail(): Email {
    return this.props.donorEmail;
  }
  get amount(): Money {
    return this.props.amount;
  }
  get campaignId(): UniqueId | null {
    return this.props.campaignId;
  }
  get frequency(): DonationFrequency {
    return this.props.frequency;
  }
  get status(): DonationStatus {
    return this.props.status;
  }
  get paymentIntentId(): string | null {
    return this.props.paymentIntentId;
  }
  get idempotencyKey(): string {
    return this.props.idempotencyKey;
  }
  get metadata(): Record<string, string> {
    return this.props.metadata;
  }
  get failureReason(): string | null {
    return this.props.failureReason;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get completedAt(): Date | null {
    return this.props.completedAt;
  }
  get refundedAt(): Date | null {
    return this.props.refundedAt;
  }

  get isPending(): boolean {
    return (
      this.props.status === "INTENT_CREATED" ||
      this.props.status === "PROCESSING"
    );
  }

  get isRecurring(): boolean {
    return isRecurringFrequency(this.props.frequency);
  }

  // ── transitions ───────────────────────────────────

  attachPaymentIntent(paymentIntentId: string): void {
    if (this.props.paymentIntentId && this.props.paymentIntentId !== paymentIntentId) {
      throw new ConflictError(
        "Donation already has a different payment intent attached",
      );
    }
    this.props.paymentIntentId = paymentIntentId;
    if (this.props.status === "INTENT_CREATED") {
      this.props.status = "PROCESSING";
    }
  }

  confirm(paymentIntentId: string, now: Date = new Date()): void {
    if (this.props.status === "COMPLETED") return; // idempotent
    if (this.props.status !== "INTENT_CREATED" && this.props.status !== "PROCESSING") {
      throw new ConflictError(
        `Cannot confirm donation in status ${this.props.status}`,
      );
    }
    if (this.props.paymentIntentId && this.props.paymentIntentId !== paymentIntentId) {
      throw new ConflictError(
        "Payment intent ID does not match the donation's pending intent",
      );
    }
    this.props.paymentIntentId = paymentIntentId;
    this.props.status = "COMPLETED";
    this.props.completedAt = now;

    this.addDomainEvent(
      donationCompleted({
        donationId: this.id.value,
        donorEmail: this.props.donorEmail.value,
        amountCents: this.props.amount.amountCents,
        currency: this.props.amount.currency,
        campaignId: this.props.campaignId?.value ?? null,
        paymentIntentId,
      }),
    );
  }

  fail(reason: string): void {
    if (this.props.status === "FAILED") return;
    if (
      this.props.status !== "INTENT_CREATED" &&
      this.props.status !== "PROCESSING"
    ) {
      throw new ConflictError(
        `Cannot fail donation in status ${this.props.status}`,
      );
    }
    this.props.status = "FAILED";
    this.props.failureReason = reason;
    this.addDomainEvent(
      donationFailed({ donationId: this.id.value, reason }),
    );
  }

  refund(now: Date = new Date()): void {
    if (this.props.status !== "COMPLETED") {
      throw new ConflictError(
        `Only completed donations can be refunded (was ${this.props.status})`,
      );
    }
    this.props.status = "REFUNDED";
    this.props.refundedAt = now;
    this.addDomainEvent(
      donationRefunded({
        donationId: this.id.value,
        amountCents: this.props.amount.amountCents,
        currency: this.props.amount.currency,
      }),
    );
  }

  cancel(): void {
    if (
      this.props.status !== "INTENT_CREATED" &&
      this.props.status !== "PROCESSING"
    ) {
      throw new ConflictError(
        `Cannot cancel donation in status ${this.props.status}`,
      );
    }
    this.props.status = "CANCELLED";
  }
}
