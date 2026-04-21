import { Entity } from "../../../../shared/domain/Entity";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";

export interface AuditLogProps {
  userId: UniqueId | null;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export class AuditLogEntry extends Entity<AuditLogProps> {
  static record(params: {
    id?: UniqueId;
    userId: UniqueId | null;
    action: string;
    resource: string;
    details?: Record<string, unknown>;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): AuditLogEntry {
    return new AuditLogEntry(params.id ?? UniqueId.generate(), {
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      details: params.details ?? {},
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: UniqueId, props: AuditLogProps): AuditLogEntry {
    return new AuditLogEntry(id, props);
  }

  get userId(): UniqueId | null {
    return this.props.userId;
  }
  get action(): string {
    return this.props.action;
  }
  get resource(): string {
    return this.props.resource;
  }
  get details(): Record<string, unknown> {
    return this.props.details;
  }
  get ipAddress(): string | null {
    return this.props.ipAddress;
  }
  get userAgent(): string | null {
    return this.props.userAgent;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
