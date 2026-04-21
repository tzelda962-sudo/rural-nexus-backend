import {
  PaginatedResult,
  PaginationParams,
} from "../../../../../shared/application/PaginatedQuery";
import { AuditLogEntry } from "../../entities/AuditLogEntry";

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AuditLogRepository {
  save(entry: AuditLogEntry): Promise<void>;
  search(
    filters: AuditLogFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<AuditLogEntry>>;
}
