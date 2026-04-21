import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { Report } from "../../domain/entities/Report";
import {
  GenerateReport,
  GenerateReportInput,
  GenerateReportOutput,
} from "../../domain/ports/inbound/GenerateReport";
import { ReportExporter } from "../../domain/ports/outbound/ReportExporter";
import { ReportRepository } from "../../domain/ports/outbound/ReportRepository";
import { isReportFormat, ReportFormat } from "../../domain/value-objects/ReportFormat";
import { isReportType, ReportType } from "../../domain/value-objects/ReportType";

const REPORT_TITLES: Record<ReportType, string> = {
  FINANCIAL_SUMMARY: "Financial Summary",
  DONATION_DETAIL: "Donation Detail",
  IMPACT_SUMMARY: "Impact Summary",
  VOLUNTEER_HOURS: "Volunteer Hours",
  DONOR_RETENTION: "Donor Retention",
  TAX_REPORT: "Tax Report",
};

export class GenerateReportUseCase implements GenerateReport {
  constructor(
    private readonly reports: ReportRepository,
    private readonly exporter: ReportExporter,
  ) {}

  async execute(input: GenerateReportInput): Promise<GenerateReportOutput> {
    if (!isReportType(input.type)) {
      throw new ValidationError(`Invalid report type: ${input.type}`);
    }
    if (!isReportFormat(input.format)) {
      throw new ValidationError(`Invalid report format: ${input.format}`);
    }

    const type = input.type as ReportType;
    const format = input.format as ReportFormat;

    const report = Report.request({
      type,
      format,
      title: REPORT_TITLES[type],
      parameters: {
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        campaignIds: input.campaignIds,
      },
      generatedBy: UniqueId.fromString(input.generatedBy),
    });

    await this.reports.save(report);

    // Async generation — in a real system this would be dispatched to a BullMQ worker.
    // For now, we generate synchronously and update the report.
    try {
      report.markGenerating();
      await this.reports.save(report);

      const { fileUrl } = await this.exporter.export({
        type,
        format,
        parameters: report.parameters,
      });

      report.complete(fileUrl);
      await this.reports.save(report);
    } catch (err) {
      const reason =
        err instanceof Error ? err.message : "Report generation failed";
      report.fail(reason);
      await this.reports.save(report);
    }

    return {
      reportId: report.id.value,
      status: report.status,
      estimatedSeconds: 30,
    };
  }
}
