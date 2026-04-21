import { AggregateRoot } from "../../../../shared/domain/AggregateRoot";
import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { Money } from "../../../../shared/domain/value-objects/Money";
import { Slug } from "../../../../shared/domain/value-objects/Slug";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { campaignCreated } from "../events/CampaignCreated";
import { campaignGoalReached } from "../events/CampaignGoalReached";
import { campaignPublished } from "../events/CampaignPublished";
import { CampaignStatus } from "../value-objects/CampaignStatus";
import { FundingGoal } from "../value-objects/FundingGoal";

export const MIN_TITLE_LENGTH = 5;
export const MAX_TITLE_LENGTH = 200;
export const MIN_DESCRIPTION_LENGTH = 20;
export const MAX_TAGS = 10;

interface CampaignProps {
  title: string;
  slug: Slug;
  description: string;
  coverImageUrl: string | null;
  fundingGoal: FundingGoal;
  amountRaised: Money;
  donationCount: number;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date | null;
  createdBy: UniqueId;
  tags: string[];
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCampaignParams {
  title: string;
  description: string;
  fundingGoal: FundingGoal;
  startDate: Date;
  endDate?: Date;
  createdBy: UniqueId;
  tags?: string[];
}

export class Campaign extends AggregateRoot<CampaignProps> {
  static create(params: CreateCampaignParams): Campaign {
    if (
      params.title.length < MIN_TITLE_LENGTH ||
      params.title.length > MAX_TITLE_LENGTH
    ) {
      throw new ValidationError(
        `Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters`,
      );
    }
    if (params.description.length < MIN_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`,
      );
    }
    const tags = params.tags ?? [];
    if (tags.length > MAX_TAGS) {
      throw new ValidationError(`Maximum ${MAX_TAGS} tags allowed`);
    }
    if (params.endDate && params.endDate <= params.startDate) {
      throw new ValidationError("End date must be after start date");
    }

    const id = UniqueId.generate();
    const slug = Slug.fromTitle(params.title);
    const currency = params.fundingGoal.target.currency;
    const now = new Date();

    const campaign = new Campaign(id, {
      title: params.title,
      slug,
      description: params.description,
      coverImageUrl: null,
      fundingGoal: params.fundingGoal,
      amountRaised: Money.zero(currency),
      donationCount: 0,
      status: "DRAFT",
      startDate: params.startDate,
      endDate: params.endDate ?? null,
      createdBy: params.createdBy,
      tags: [...new Set(tags.map((t) => t.trim().toLowerCase()))],
      isPublished: false,
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    campaign.addDomainEvent(
      campaignCreated({
        campaignId: id.value,
        title: params.title,
        slug: slug.value,
        createdBy: params.createdBy.value,
        fundingGoalCents: params.fundingGoal.target.amountCents,
        currency,
      }),
    );

    return campaign;
  }

  static rehydrate(id: UniqueId, props: CampaignProps): Campaign {
    return new Campaign(id, props);
  }

  // ─── State transitions ──────────────────────────────────────

  publish(now = new Date()): void {
    if (this.props.status !== "DRAFT") {
      throw new ConflictError(
        `Cannot publish campaign in ${this.props.status} status`,
      );
    }
    this.props.status = "ACTIVE";
    this.props.isPublished = true;
    this.props.publishedAt = now;
    this.props.updatedAt = now;

    this.addDomainEvent(
      campaignPublished({
        campaignId: this._id.value,
        slug: this.props.slug.value,
      }),
    );
  }

  pause(now = new Date()): void {
    if (this.props.status !== "ACTIVE") {
      throw new ConflictError(
        `Cannot pause campaign in ${this.props.status} status`,
      );
    }
    this.props.status = "PAUSED";
    this.props.updatedAt = now;
  }

  close(now = new Date()): void {
    if (this.props.status !== "ACTIVE") {
      throw new ConflictError(
        `Cannot close campaign in ${this.props.status} status`,
      );
    }
    this.props.status = "CLOSED";
    this.props.updatedAt = now;
  }

  archive(now = new Date()): void {
    if (this.props.status !== "CLOSED") {
      throw new ConflictError(
        `Cannot archive campaign in ${this.props.status} status`,
      );
    }
    this.props.status = "ARCHIVED";
    this.props.updatedAt = now;
  }

  recordDonation(amount: Money, now = new Date()): void {
    if (this.props.status !== "ACTIVE") {
      throw new ConflictError("Can only record donations on active campaigns");
    }
    const wasBelowGoal = !this.isGoalReached;
    this.props.amountRaised = this.props.amountRaised.add(amount);
    this.props.donationCount += 1;
    this.props.updatedAt = now;

    if (wasBelowGoal && this.isGoalReached) {
      this.addDomainEvent(
        campaignGoalReached({
          campaignId: this._id.value,
          title: this.props.title,
          goalCents: this.props.fundingGoal.target.amountCents,
          raisedCents: this.props.amountRaised.amountCents,
          currency: this.props.amountRaised.currency,
        }),
      );
    }
  }

  updateDetails(
    params: Partial<{ title: string; description: string; endDate: Date }>,
    now = new Date(),
  ): void {
    if (params.title !== undefined) {
      if (
        params.title.length < MIN_TITLE_LENGTH ||
        params.title.length > MAX_TITLE_LENGTH
      ) {
        throw new ValidationError(
          `Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters`,
        );
      }
      this.props.title = params.title;
      this.props.slug = Slug.fromTitle(params.title);
    }
    if (params.description !== undefined) {
      if (params.description.length < MIN_DESCRIPTION_LENGTH) {
        throw new ValidationError(
          `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`,
        );
      }
      this.props.description = params.description;
    }
    if (params.endDate !== undefined) {
      if (params.endDate <= this.props.startDate) {
        throw new ValidationError("End date must be after start date");
      }
      this.props.endDate = params.endDate;
    }
    this.props.updatedAt = now;
  }

  // ─── Getters ────────────────────────────────────────────────

  get title(): string {
    return this.props.title;
  }
  get slug(): Slug {
    return this.props.slug;
  }
  get description(): string {
    return this.props.description;
  }
  get coverImageUrl(): string | null {
    return this.props.coverImageUrl;
  }
  get fundingGoal(): FundingGoal {
    return this.props.fundingGoal;
  }
  get amountRaised(): Money {
    return this.props.amountRaised;
  }
  get donationCount(): number {
    return this.props.donationCount;
  }
  get status(): CampaignStatus {
    return this.props.status;
  }
  get startDate(): Date {
    return this.props.startDate;
  }
  get endDate(): Date | null {
    return this.props.endDate;
  }
  get createdBy(): UniqueId {
    return this.props.createdBy;
  }
  get tags(): string[] {
    return [...this.props.tags];
  }
  get isPublished(): boolean {
    return this.props.isPublished;
  }
  get publishedAt(): Date | null {
    return this.props.publishedAt;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get progressPercentage(): number {
    const goal = this.props.fundingGoal.target.amountCents;
    if (goal === 0) return 100;
    return Math.min(
      100,
      Math.round((this.props.amountRaised.amountCents / goal) * 10000) / 100,
    );
  }

  get isGoalReached(): boolean {
    return this.props.fundingGoal.isReached(this.props.amountRaised);
  }

  get isExpired(): boolean {
    if (!this.props.endDate) return false;
    return new Date() > this.props.endDate;
  }
}
