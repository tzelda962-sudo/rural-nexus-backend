import { AggregateRoot } from "../../../../shared/domain/AggregateRoot";
import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { ReportFormat } from "../value-objects/ReportFormat";
import { ReportType } from "../value-objects/ReportType";

export type ReportStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";

interface ReportProps {
  type: ReportType;
  format: ReportFormat;
  title: string;
  parameters: Record<string, unknown>;
  status: ReportStatus;
  fileUrl: string | null;
  failureReason: string | null;
  generatedBy: UniqueId;
  generatedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

const REPORT_EXPIRY_HOURS = 24;

export class Report extends AggregateRoot<ReportProps> {
  static request(params: {
    type: ReportType;
    format: ReportFormat;
    title: string;
    parameters?: Record<string, unknown>;
    generatedBy: UniqueId;
  }): Report {
    if (!params.title || params.title.trim().length === 0) {
      throw new ValidationError("Report title is required");
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + REPORT_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    return new Report(UniqueId.generate(), {
      type: params.type,
      format: params.format,
      title: params.title,
      parameters: params.parameters ?? {},
      status: "PENDING",
      fileUrl: null,
      failureReason: null,
      generatedBy: params.generatedBy,
      generatedAt: null,
      expiresAt,
      createdAt: now,
    });
  }

  static rehydrate(id: UniqueId, props: ReportProps): Report {
    return new Report(id, props);
  }

  markGenerating(): void {
    if (this.props.status !== "PENDING") {
      throw new ConflictError(
        `Cannot start generating report in ${this.props.status} status`,
      );
    }
    this.props.status = "GENERATING";
  }

  complete(fileUrl: string, now = new Date()): void {
    if (
      this.props.status !== "PENDING" &&
      this.props.status !== "GENERATING"
    ) {
      throw new ConflictError(
        `Cannot complete report in ${this.props.status} status`,
      );
    }
    this.props.status = "COMPLETED";
    this.props.fileUrl = fileUrl;
    this.props.generatedAt = now;
  }

  fail(reason: string): void {
    if (this.props.status === "COMPLETED") {
      throw new ConflictError("Cannot fail a completed report");
    }
    this.props.status = "FAILED";
    this.props.failureReason = reason;
  }

  get type(): ReportType {
    return this.props.type;
  }
  get format(): ReportFormat {
    return this.props.format;
  }
  get title(): string {
    return this.props.title;
  }
  get parameters(): Record<string, unknown> {
    return { ...this.props.parameters };
  }
  get status(): ReportStatus {
    return this.props.status;
  }
  get fileUrl(): string | null {
    return this.props.fileUrl;
  }
  get failureReason(): string | null {
    return this.props.failureReason;
  }
  get generatedBy(): UniqueId {
    return this.props.generatedBy;
  }
  get generatedAt(): Date | null {
    return this.props.generatedAt;
  }
  get expiresAt(): Date {
    return this.props.expiresAt;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}
