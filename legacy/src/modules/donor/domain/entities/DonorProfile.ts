import { AggregateRoot } from "../../../../shared/domain/AggregateRoot";
import { Money } from "../../../../shared/domain/value-objects/Money";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  CommunicationPreferences,
  DEFAULT_COMM_PREFS,
} from "../value-objects/CommunicationPreferences";
import { DonorTier, tierForAmount } from "../value-objects/DonorTier";

interface DonorProfileProps {
  userId: UniqueId;
  tier: DonorTier;
  totalDonatedAllTime: Money;
  donationCount: number;
  firstDonationAt: Date | null;
  lastDonationAt: Date | null;
  isAnonymousPreferred: boolean;
  communicationPreferences: CommunicationPreferences;
  updatedAt: Date;
}

export class DonorProfile extends AggregateRoot<DonorProfileProps> {
  static create(userId: UniqueId, currency = "USD"): DonorProfile {
    const now = new Date();
    return new DonorProfile(UniqueId.generate(), {
      userId,
      tier: "BRONZE",
      totalDonatedAllTime: Money.zero(currency),
      donationCount: 0,
      firstDonationAt: null,
      lastDonationAt: null,
      isAnonymousPreferred: false,
      communicationPreferences: { ...DEFAULT_COMM_PREFS },
      updatedAt: now,
    });
  }

  static rehydrate(id: UniqueId, props: DonorProfileProps): DonorProfile {
    return new DonorProfile(id, props);
  }

  recordDonation(amount: Money, now = new Date()): void {
    this.props.totalDonatedAllTime =
      this.props.totalDonatedAllTime.add(amount);
    this.props.donationCount += 1;
    if (!this.props.firstDonationAt) {
      this.props.firstDonationAt = now;
    }
    this.props.lastDonationAt = now;
    this.props.updatedAt = now;
    this.recalculateTier();
  }

  recalculateTier(): void {
    this.props.tier = tierForAmount(
      this.props.totalDonatedAllTime.amountCents,
    );
  }

  updateCommunicationPreferences(
    prefs: Partial<CommunicationPreferences>,
    now = new Date(),
  ): void {
    this.props.communicationPreferences = {
      ...this.props.communicationPreferences,
      ...prefs,
    };
    this.props.updatedAt = now;
  }

  setAnonymous(isAnonymous: boolean, now = new Date()): void {
    this.props.isAnonymousPreferred = isAnonymous;
    this.props.updatedAt = now;
  }

  get userId(): UniqueId {
    return this.props.userId;
  }
  get tier(): DonorTier {
    return this.props.tier;
  }
  get totalDonatedAllTime(): Money {
    return this.props.totalDonatedAllTime;
  }
  get donationCount(): number {
    return this.props.donationCount;
  }
  get firstDonationAt(): Date | null {
    return this.props.firstDonationAt;
  }
  get lastDonationAt(): Date | null {
    return this.props.lastDonationAt;
  }
  get isAnonymousPreferred(): boolean {
    return this.props.isAnonymousPreferred;
  }
  get communicationPreferences(): CommunicationPreferences {
    return { ...this.props.communicationPreferences };
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
