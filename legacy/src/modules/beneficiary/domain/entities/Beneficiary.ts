import { Entity } from "../../../../shared/domain/Entity";
import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { BeneficiaryStatus } from "../value-objects/BeneficiaryStatus";

interface BeneficiaryProps {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  location: string;
  programIds: UniqueId[];
  status: BeneficiaryStatus;
  notes: string;
  enrolledAt: Date;
  updatedAt: Date;
}

export class Beneficiary extends Entity<BeneficiaryProps> {
  static enroll(params: {
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    location: string;
    notes?: string;
  }): Beneficiary {
    if (!params.firstName || params.firstName.trim().length === 0) {
      throw new ValidationError("First name is required");
    }
    if (!params.lastName || params.lastName.trim().length === 0) {
      throw new ValidationError("Last name is required");
    }
    if (!params.location || params.location.trim().length === 0) {
      throw new ValidationError("Location is required");
    }

    const now = new Date();
    return new Beneficiary(UniqueId.generate(), {
      firstName: params.firstName.trim(),
      lastName: params.lastName.trim(),
      dateOfBirth: params.dateOfBirth ?? null,
      location: params.location.trim(),
      programIds: [],
      status: "ACTIVE",
      notes: params.notes?.trim() ?? "",
      enrolledAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: UniqueId, props: BeneficiaryProps): Beneficiary {
    return new Beneficiary(id, props);
  }

  assignToProgram(programId: UniqueId, now = new Date()): void {
    if (this.props.status !== "ACTIVE") {
      throw new ConflictError(
        `Cannot assign ${this.props.status} beneficiary to a program`,
      );
    }
    const alreadyAssigned = this.props.programIds.some((id) =>
      id.equals(programId),
    );
    if (alreadyAssigned) return;
    this.props.programIds.push(programId);
    this.props.updatedAt = now;
  }

  graduate(now = new Date()): void {
    if (this.props.status !== "ACTIVE") {
      throw new ConflictError(
        `Cannot graduate beneficiary in ${this.props.status} status`,
      );
    }
    this.props.status = "GRADUATED";
    this.props.updatedAt = now;
  }

  deactivate(now = new Date()): void {
    if (this.props.status === "INACTIVE") return;
    this.props.status = "INACTIVE";
    this.props.updatedAt = now;
  }

  get firstName(): string {
    return this.props.firstName;
  }
  get lastName(): string {
    return this.props.lastName;
  }
  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }
  get dateOfBirth(): Date | null {
    return this.props.dateOfBirth;
  }
  get location(): string {
    return this.props.location;
  }
  get programIds(): UniqueId[] {
    return [...this.props.programIds];
  }
  get status(): BeneficiaryStatus {
    return this.props.status;
  }
  get notes(): string {
    return this.props.notes;
  }
  get enrolledAt(): Date {
    return this.props.enrolledAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
