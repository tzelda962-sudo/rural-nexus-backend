import { Entity } from "../../../../shared/domain/Entity";
import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { Email } from "../../../../shared/domain/value-objects/Email";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { NotificationChannel } from "../value-objects/NotificationChannel";
import { NotificationStatus } from "../value-objects/NotificationStatus";
import { TemplateId } from "../value-objects/TemplateId";

export const MAX_RETRIES = 3;

interface NotificationProps {
  recipientId: UniqueId | null;
  recipientEmail: Email;
  channel: NotificationChannel;
  templateId: TemplateId;
  subject: string;
  body: string;
  variables: Record<string, string>;
  status: NotificationStatus;
  sentAt: Date | null;
  failureReason: string | null;
  retryCount: number;
  createdAt: Date;
}

interface CreateNotificationParams {
  recipientId?: UniqueId;
  recipientEmail: Email;
  channel: NotificationChannel;
  templateId: TemplateId;
  subject: string;
  body: string;
  variables?: Record<string, string>;
}

export class Notification extends Entity<NotificationProps> {
  static create(params: CreateNotificationParams): Notification {
    if (!params.subject || params.subject.trim().length === 0) {
      throw new ValidationError("Notification subject is required");
    }
    if (!params.body || params.body.trim().length === 0) {
      throw new ValidationError("Notification body is required");
    }

    return new Notification(UniqueId.generate(), {
      recipientId: params.recipientId ?? null,
      recipientEmail: params.recipientEmail,
      channel: params.channel,
      templateId: params.templateId,
      subject: params.subject,
      body: params.body,
      variables: params.variables ?? {},
      status: "QUEUED",
      sentAt: null,
      failureReason: null,
      retryCount: 0,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: UniqueId, props: NotificationProps): Notification {
    return new Notification(id, props);
  }

  markSent(now = new Date()): void {
    if (this.props.status === "SENT") return;
    this.props.status = "SENT";
    this.props.sentAt = now;
    this.props.failureReason = null;
  }

  markFailed(reason: string): void {
    if (this.props.status === "SENT") {
      throw new ConflictError("Cannot fail an already-sent notification");
    }
    this.props.status = "FAILED";
    this.props.failureReason = reason;
    this.props.retryCount += 1;
  }

  markBounced(reason: string): void {
    this.props.status = "BOUNCED";
    this.props.failureReason = reason;
  }

  canRetry(): boolean {
    return (
      this.props.status === "FAILED" && this.props.retryCount < MAX_RETRIES
    );
  }

  requeueForRetry(): void {
    if (!this.canRetry()) {
      throw new ConflictError(
        `Cannot retry notification: status=${this.props.status}, retries=${this.props.retryCount}`,
      );
    }
    this.props.status = "QUEUED";
  }

  get recipientId(): UniqueId | null {
    return this.props.recipientId;
  }
  get recipientEmail(): Email {
    return this.props.recipientEmail;
  }
  get channel(): NotificationChannel {
    return this.props.channel;
  }
  get templateId(): TemplateId {
    return this.props.templateId;
  }
  get subject(): string {
    return this.props.subject;
  }
  get body(): string {
    return this.props.body;
  }
  get variables(): Record<string, string> {
    return { ...this.props.variables };
  }
  get status(): NotificationStatus {
    return this.props.status;
  }
  get sentAt(): Date | null {
    return this.props.sentAt;
  }
  get failureReason(): string | null {
    return this.props.failureReason;
  }
  get retryCount(): number {
    return this.props.retryCount;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
