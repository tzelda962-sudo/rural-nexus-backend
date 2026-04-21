import { AggregateRoot } from "../../../../shared/domain/AggregateRoot";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { Email } from "../../../../shared/domain/value-objects/Email";
import { PhoneNumber } from "../../../../shared/domain/value-objects/PhoneNumber";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { volunteerRegistered } from "../events/VolunteerRegistered";
import { Availability } from "../value-objects/Availability";
import { Skill } from "../value-objects/Skill";
import { VolunteerStatus } from "../value-objects/VolunteerStatus";

export type BackgroundCheckStatus =
  | "PENDING"
  | "CLEARED"
  | "FLAGGED"
  | "NOT_REQUIRED";

export interface VolunteerProps {
  userId: UniqueId;
  firstName: string;
  lastName: string;
  email: Email;
  phone: PhoneNumber | null;
  skills: Skill[];
  availability: Availability;
  status: VolunteerStatus;
  notes: string;
  backgroundCheckStatus: BackgroundCheckStatus;
  totalHoursLogged: number;
  joinedAt: Date;
  updatedAt: Date;
}

export class Volunteer extends AggregateRoot<VolunteerProps> {
  static register(params: {
    id?: UniqueId;
    userId: UniqueId;
    firstName: string;
    lastName: string;
    email: Email;
    phone?: PhoneNumber | null;
    skills: Skill[];
    availability: Availability;
    notes?: string;
  }): Volunteer {
    if (params.firstName.trim().length === 0 || params.firstName.length > 100) {
      throw new ValidationError("firstName must be 1–100 characters");
    }
    if (params.lastName.trim().length === 0 || params.lastName.length > 100) {
      throw new ValidationError("lastName must be 1–100 characters");
    }

    const now = new Date();
    const volunteer = new Volunteer(params.id ?? UniqueId.generate(), {
      userId: params.userId,
      firstName: params.firstName.trim(),
      lastName: params.lastName.trim(),
      email: params.email,
      phone: params.phone ?? null,
      skills: dedupeSkills(params.skills),
      availability: params.availability,
      status: "PENDING_REVIEW",
      notes: params.notes ?? "",
      backgroundCheckStatus: "PENDING",
      totalHoursLogged: 0,
      joinedAt: now,
      updatedAt: now,
    });
    volunteer.addDomainEvent(
      volunteerRegistered({
        volunteerId: volunteer.id.value,
        userId: params.userId.value,
        email: params.email.value,
        firstName: params.firstName,
      }),
    );
    return volunteer;
  }

  static rehydrate(id: UniqueId, props: VolunteerProps): Volunteer {
    return new Volunteer(id, props);
  }

  // ── accessors ─────────────────────────────────────
  get userId(): UniqueId {
    return this.props.userId;
  }
  get firstName(): string {
    return this.props.firstName;
  }
  get lastName(): string {
    return this.props.lastName;
  }
  get email(): Email {
    return this.props.email;
  }
  get phone(): PhoneNumber | null {
    return this.props.phone;
  }
  get skills(): readonly Skill[] {
    return this.props.skills;
  }
  get availability(): Availability {
    return this.props.availability;
  }
  get status(): VolunteerStatus {
    return this.props.status;
  }
  get notes(): string {
    return this.props.notes;
  }
  get backgroundCheckStatus(): BackgroundCheckStatus {
    return this.props.backgroundCheckStatus;
  }
  get totalHoursLogged(): number {
    return this.props.totalHoursLogged;
  }
  get joinedAt(): Date {
    return this.props.joinedAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ── transitions ───────────────────────────────────

  updateAvailability(availability: Availability): void {
    this.props.availability = availability;
    this.props.updatedAt = new Date();
  }

  addSkill(skill: Skill): void {
    if (this.props.skills.some((s) => s.equals(skill))) return;
    this.props.skills = [...this.props.skills, skill];
    this.props.updatedAt = new Date();
  }

  removeSkill(name: string): void {
    const before = this.props.skills.length;
    this.props.skills = this.props.skills.filter(
      (s) => s.name.toLowerCase() !== name.toLowerCase(),
    );
    if (this.props.skills.length !== before) {
      this.props.updatedAt = new Date();
    }
  }

  activate(): void {
    if (this.props.status === "ACTIVE") return;
    if (this.props.status === "SUSPENDED") {
      throw new ValidationError("Cannot activate a suspended volunteer");
    }
    this.props.status = "ACTIVE";
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.status = "INACTIVE";
    this.props.updatedAt = new Date();
  }

  suspend(): void {
    this.props.status = "SUSPENDED";
    this.props.updatedAt = new Date();
  }

  setBackgroundCheck(status: BackgroundCheckStatus): void {
    this.props.backgroundCheckStatus = status;
    this.props.updatedAt = new Date();
  }

  logHours(hours: number): void {
    if (!Number.isFinite(hours) || hours <= 0) {
      throw new ValidationError("hours must be a positive number");
    }
    this.props.totalHoursLogged += hours;
    this.props.updatedAt = new Date();
  }
}

function dedupeSkills(skills: Skill[]): Skill[] {
  const seen = new Set<string>();
  const result: Skill[] = [];
  for (const s of skills) {
    const key = `${s.name.toLowerCase()}::${s.proficiency}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(s);
    }
  }
  return result;
}
