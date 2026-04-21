import { Entity } from "../../../../shared/domain/Entity";
import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { ProgramStatus } from "../value-objects/ProgramStatus";

interface ProgramProps {
  name: string;
  description: string;
  campaignId: UniqueId | null;
  capacity: number;
  enrolledCount: number;
  status: ProgramStatus;
  createdAt: Date;
}

export class Program extends Entity<ProgramProps> {
  static create(params: {
    name: string;
    description?: string;
    campaignId?: UniqueId;
    capacity: number;
  }): Program {
    if (!params.name || params.name.trim().length === 0) {
      throw new ValidationError("Program name is required");
    }
    if (params.capacity < 1) {
      throw new ValidationError("Program capacity must be at least 1");
    }

    return new Program(UniqueId.generate(), {
      name: params.name.trim(),
      description: params.description?.trim() ?? "",
      campaignId: params.campaignId ?? null,
      capacity: params.capacity,
      enrolledCount: 0,
      status: "PLANNED",
      createdAt: new Date(),
    });
  }

  static rehydrate(id: UniqueId, props: ProgramProps): Program {
    return new Program(id, props);
  }

  activate(): void {
    if (this.props.status !== "PLANNED") {
      throw new ConflictError(
        `Cannot activate program in ${this.props.status} status`,
      );
    }
    this.props.status = "ACTIVE";
  }

  complete(): void {
    if (this.props.status !== "ACTIVE") {
      throw new ConflictError(
        `Cannot complete program in ${this.props.status} status`,
      );
    }
    this.props.status = "COMPLETED";
  }

  enrollOne(): void {
    if (this.props.status !== "ACTIVE") {
      throw new ConflictError("Can only enroll in active programs");
    }
    if (this.isFull) {
      throw new ConflictError("Program is at capacity");
    }
    this.props.enrolledCount += 1;
  }

  get name(): string {
    return this.props.name;
  }
  get description(): string {
    return this.props.description;
  }
  get campaignId(): UniqueId | null {
    return this.props.campaignId;
  }
  get capacity(): number {
    return this.props.capacity;
  }
  get enrolledCount(): number {
    return this.props.enrolledCount;
  }
  get status(): ProgramStatus {
    return this.props.status;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get isFull(): boolean {
    return this.props.enrolledCount >= this.props.capacity;
  }
  get availableSlots(): number {
    return Math.max(0, this.props.capacity - this.props.enrolledCount);
  }
}
