import {
  PaginatedResult,
  PaginationParams,
} from "../../../../../shared/application/PaginatedQuery";
import { UseCase } from "../../../../../shared/application/UseCase";
import { AuditLogEntry } from "../../entities/AuditLogEntry";

export interface GetAuditLogsInput {
  pagination: PaginationParams;
  filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}

export interface AuditLogDto {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface GetAuditLogs
  extends UseCase<GetAuditLogsInput, PaginatedResult<AuditLogDto>> {}

export function toAuditLogDto(entry: AuditLogEntry): AuditLogDto {
  return {
    id: entry.id.value,
    userId: entry.userId?.value ?? null,
    action: entry.action,
    resource: entry.resource,
    details: entry.details,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
    createdAt: entry.createdAt.toISOString(),
  };
}
