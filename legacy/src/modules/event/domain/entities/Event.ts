import { AggregateRoot } from "../../../../shared/domain/AggregateRoot";
import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { Slug } from "../../../../shared/domain/value-objects/Slug";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { attendeeRegistered } from "../events/AttendeeRegistered";
import { eventCancelled } from "../events/EventCancelled";
import { eventPublished } from "../events/EventPublished";
import { EventLocation } from "../value-objects/EventLocation";
import { EventStatus } from "../value-objects/EventStatus";
import { EventType } from "../value-objects/EventType";
import { EventRegistration } from "./EventRegistration";

export const MIN_TITLE_LENGTH = 5;
export const MAX_TITLE_LENGTH = 200;
export const MIN_DESCRIPTION_LENGTH = 20;

interface EventProps {
  title: string;
  slug: Slug;
  description: string;
  type: EventType;
  campaignId: UniqueId | null;
  location: EventLocation;
  startDate: Date;
  endDate: Date;
  maxAttendees: number | null;
  registrationCount: number;
  status: EventStatus;
  createdBy: UniqueId;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateEventParams {
  title: string;
  description: string;
  type: EventType;
  campaignId?: UniqueId;
  location: EventLocation;
  startDate: Date;
  endDate: Date;
  maxAttendees?: number | null;
  createdBy: UniqueId;
}

export class Event extends AggregateRoot<EventProps> {
  static create(params: CreateEventParams): Event {
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
    if (params.endDate <= params.startDate) {
      throw new ValidationError("End date must be after start date");
    }
    if (
      params.maxAttendees !== undefined &&
      params.maxAttendees !== null &&
      params.maxAttendees < 1
    ) {
      throw new ValidationError("Max attendees must be at least 1");
    }

    const now = new Date();
    return new Event(UniqueId.generate(), {
      title: params.title,
      slug: Slug.fromTitle(params.title),
      description: params.description,
      type: params.type,
      campaignId: params.campaignId ?? null,
      location: params.location,
      startDate: params.startDate,
      endDate: params.endDate,
      maxAttendees: params.maxAttendees ?? null,
      registrationCount: 0,
      status: "DRAFT",
      createdBy: params.createdBy,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: UniqueId, props: EventProps): Event {
    return new Event(id, props);
  }

  // ─── State transitions ──────────────────────────────────────

  publish(now = new Date()): void {
    if (this.props.status !== "DRAFT") {
      throw new ConflictError(
        `Cannot publish event in ${this.props.status} status`,
      );
    }
    this.props.status = "PUBLISHED";
    this.props.updatedAt = now;

    this.addDomainEvent(
      eventPublished({
        eventId: this._id.value,
        title: this.props.title,
        slug: this.props.slug.value,
      }),
    );
  }

  cancel(reason: string, now = new Date()): void {
    if (this.props.status !== "PUBLISHED") {
      throw new ConflictError(
        `Cannot cancel event in ${this.props.status} status`,
      );
    }
    if (!reason.trim()) {
      throw new ValidationError("Cancellation reason is required");
    }
    this.props.status = "CANCELLED";
    this.props.updatedAt = now;

    this.addDomainEvent(
      eventCancelled({
        eventId: this._id.value,
        title: this.props.title,
        reason: reason.trim(),
      }),
    );
  }

  complete(now = new Date()): void {
    if (this.props.status !== "PUBLISHED") {
      throw new ConflictError(
        `Cannot complete event in ${this.props.status} status`,
      );
    }
    this.props.status = "COMPLETED";
    this.props.updatedAt = now;
  }

  registerAttendee(userId: UniqueId): EventRegistration {
    if (this.props.status !== "PUBLISHED") {
      throw new ConflictError("Can only register for published events");
    }
    if (this.isFull) {
      throw new ConflictError("Event is at full capacity");
    }

    const registration = EventRegistration.create(this._id, userId);
    this.props.registrationCount += 1;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      attendeeRegistered({
        eventId: this._id.value,
        userId: userId.value,
        registrationId: registration.id.value,
        eventTitle: this.props.title,
      }),
    );

    return registration;
  }

  decrementRegistration(): void {
    if (this.props.registrationCount > 0) {
      this.props.registrationCount -= 1;
      this.props.updatedAt = new Date();
    }
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
  get type(): EventType {
    return this.props.type;
  }
  get campaignId(): UniqueId | null {
    return this.props.campaignId;
  }
  get location(): EventLocation {
    return this.props.location;
  }
  get startDate(): Date {
    return this.props.startDate;
  }
  get endDate(): Date {
    return this.props.endDate;
  }
  get maxAttendees(): number | null {
    return this.props.maxAttendees;
  }
  get registrationCount(): number {
    return this.props.registrationCount;
  }
  get status(): EventStatus {
    return this.props.status;
  }
  get createdBy(): UniqueId {
    return this.props.createdBy;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isFull(): boolean {
    if (this.props.maxAttendees === null) return false;
    return this.props.registrationCount >= this.props.maxAttendees;
  }

  get availableSlots(): number | null {
    if (this.props.maxAttendees === null) return null;
    return Math.max(0, this.props.maxAttendees - this.props.registrationCount);
  }
}
