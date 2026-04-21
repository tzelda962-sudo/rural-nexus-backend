import { NotFoundError } from "../../../../shared/domain/errors/NotFoundError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { ReportRepository } from "../../domain/ports/outbound/ReportRepository";

export interface ReportStatusOutput {
  reportId: string;
  type: string;
  format: string;
  title: string;
  status: string;
  downloadUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export class GetReportStatusUseCase {
  constructor(private readonly reports: ReportRepository) {}

  async execute(reportId: string): Promise<ReportStatusOutput> {
    const report = await this.reports.findById(
      UniqueId.fromString(reportId),
    );
    if (!report) {
      throw new NotFoundError("Report", reportId);
    }

    return {
      reportId: report.id.value,
      type: report.type,
      format: report.format,
      title: report.title,
      status: report.status,
      downloadUrl: report.fileUrl,
      expiresAt: report.expiresAt.toISOString(),
      createdAt: report.createdAt.toISOString(),
    };
  }
}
