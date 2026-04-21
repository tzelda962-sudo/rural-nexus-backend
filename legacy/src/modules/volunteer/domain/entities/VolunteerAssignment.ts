import { Entity } from "../../../../shared/domain/Entity";
import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";

export type AssignmentStatus = "ASSIGNED" | "ACTIVE" | "COMPLETED" | "WITHDRAWN";

interface AssignmentProps {
  volunteerId: UniqueId;
  campaignId: UniqueId;
  role: string;
  startDate: Date;
  endDate: Date | null;
  hoursCommitted: number;
  hoursLogged: number;
  status: AssignmentStatus;
  createdAt: Date;
}

interface CreateAssignmentParams {
  volunteerId: UniqueId;
  campaignId: UniqueId;
  role: string;
  startDate: Date;
  endDate?: Date | null;
  hoursCommitted: number;
}

export class VolunteerAssignment extends Entity<AssignmentProps> {
  static create(params: CreateAssignmentParams): VolunteerAssignment {
    if (!params.role.trim()) {
      throw new ValidationError("Assignment role is required");
    }
    if (params.role.length > 100) {
      throw new ValidationError("Role must be at most 100 characters");
    }
    if (!Number.isFinite(params.hoursCommitted) || params.hoursCommitted < 0) {
      throw new ValidationError("Hours committed must be a non-negative number");
    }
    if (params.endDate && params.endDate <= params.startDate) {
      throw new ValidationError("End date must be after start date");
    }

    return new VolunteerAssignment(UniqueId.generate(), {
      volunteerId: params.volunteerId,
      campaignId: params.campaignId,
      role: params.role.trim(),
      startDate: params.startDate,
      endDate: params.endDate ?? null,
      hoursCommitted: params.hoursCommitted,
      hoursLogged: 0,
      status: "ASSIGNED",
      createdAt: new Date(),
    });
  }

  static rehydrate(id: UniqueId, props: AssignmentProps): VolunteerAssignment {
    return new VolunteerAssignment(id, props);
  }

  activate(): void {
    if (this.props.status !== "ASSIGNED") {
      throw new ConflictError(
        `Cannot activate assignment in ${this.props.status} status`,
      );
    }
    this.props.status = "ACTIVE";
  }

  complete(hoursLogged: number): void {
    if (this.props.status !== "ACTIVE") {
      throw new ConflictError(
        `Cannot complete assignment in ${this.props.status} status`,
      );
    }
    if (!Number.isFinite(hoursLogged) || hoursLogged < 0) {
      throw new ValidationError("Hours logged must be a non-negative number");
    }
    this.props.hoursLogged = hoursLogged;
    this.props.status = "COMPLETED";
  }

  withdraw(): void {
    if (this.props.status === "COMPLETED" || this.props.status === "WITHDRAWN") {
      throw new ConflictError(
        `Cannot withdraw assignment in ${this.props.status} status`,
      );
    }
    this.props.status = "WITHDRAWN";
  }

  get volunteerId(): UniqueId {
    return this.props.volunteerId;
  }
  get campaignId(): UniqueId {
    return this.props.campaignId;
  }
  get role(): string {
    return this.props.role;
  }
  get startDate(): Date {
    return this.props.startDate;
  }
  get endDate(): Date | null {
    return this.props.endDate;
  }
  get hoursCommitted(): number {
    return this.props.hoursCommitted;
  }
  get hoursLogged(): number {
    return this.props.hoursLogged;
  }
  get status(): AssignmentStatus {
    return this.props.status;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
