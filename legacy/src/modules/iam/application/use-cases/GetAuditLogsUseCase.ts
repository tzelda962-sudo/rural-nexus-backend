import {
  PaginatedResult,
  normalizePagination,
} from "../../../../shared/application/PaginatedQuery";
import {
  AuditLogDto,
  GetAuditLogs,
  GetAuditLogsInput,
  toAuditLogDto,
} from "../../domain/ports/inbound/GetAuditLogs";
import { AuditLogRepository } from "../../domain/ports/outbound/AuditLogRepository";

export class GetAuditLogsUseCase implements GetAuditLogs {
  constructor(private readonly auditLog: AuditLogRepository) {}

  async execute(input: GetAuditLogsInput): Promise<PaginatedResult<AuditLogDto>> {
    const pagination = normalizePagination(input.pagination);
    const result = await this.auditLog.search(input.filters ?? {}, pagination);
    return {
      data: result.data.map(toAuditLogDto),
      meta: result.meta,
    };
  }
}
