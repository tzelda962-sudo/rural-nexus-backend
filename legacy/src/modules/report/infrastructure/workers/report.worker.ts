import { Job, Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { Logger } from "pino";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { createWorker, REPORT_QUEUE } from "../../../../shared/infrastructure/queue/queue-factory";
import { ReportExporter } from "../../domain/ports/outbound/ReportExporter";
import { ReportRepository } from "../../domain/ports/outbound/ReportRepository";
import { ReportFormat } from "../../domain/value-objects/ReportFormat";
import { ReportType } from "../../domain/value-objects/ReportType";

export interface ReportJobData {
  reportId: string;
  type: ReportType;
  format: ReportFormat;
  parameters: Record<string, unknown>;
}

export function createReportWorker(deps: {
  connection: ConnectionOptions;
  reports: ReportRepository;
  exporter: ReportExporter;
  logger: Logger;
}): Worker<ReportJobData> {
  const { connection, reports, exporter, logger } = deps;

  return createWorker<ReportJobData>(
    REPORT_QUEUE,
    async (job: Job<ReportJobData>) => {
      const { reportId, type, format, parameters } = job.data;

      const report = await reports.findById(UniqueId.fromString(reportId));
      if (!report) {
        logger.warn({ reportId }, "report not found — skipping job");
        return;
      }

      report.markGenerating();
      await reports.save(report);

      try {
        const { fileUrl } = await exporter.export({ type, format, parameters });
        report.complete(fileUrl);
        await reports.save(report);

        logger.info({ reportId, fileUrl }, "report generated");
      } catch (err) {
        const reason =
          err instanceof Error ? err.message : "Report generation failed";
        report.fail(reason);
        await reports.save(report);
        throw err;
      }
    },
    connection,
    2,
  );
}
