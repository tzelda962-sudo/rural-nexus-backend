import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { Logger } from "pino";
import { createQueue, REPORT_QUEUE } from "../../shared/infrastructure/queue/queue-factory";
import { GenerateReportUseCase } from "./application/use-cases/GenerateReportUseCase";
import { GetReportStatusUseCase } from "./application/use-cases/GetReportStatusUseCase";
import { LocalFileReportExporter } from "./infrastructure/adapters/external/LocalFileReportExporter";
import { registerReportRoutes } from "./infrastructure/adapters/http/report.routes";
import { PgReportRepository } from "./infrastructure/adapters/persistence/PgReportRepository";
import { createReportWorker } from "./infrastructure/workers/report.worker";
import { ReportJobData } from "./infrastructure/workers/report.worker";

export interface ReportModuleDeps {
  pool: Pool;
  redisConnection?: ConnectionOptions;
  logger?: Logger;
}

export interface ReportModule {
  registerRoutes: (fastify: FastifyInstance) => Promise<void>;
  reportQueue?: Queue<ReportJobData>;
  shutdownWorker?: () => Promise<void>;
}

export function createReportModule(deps: ReportModuleDeps): ReportModule {
  const { pool, redisConnection, logger } = deps;

  const reports = new PgReportRepository(pool);
  const outputDir = process.env.REPORT_OUTPUT_DIR || "/tmp/ngo-reports";
  const exporter = new LocalFileReportExporter(pool, outputDir);

  const generateReport = new GenerateReportUseCase(reports, exporter);
  const getReportStatus = new GetReportStatusUseCase(reports);

  let reportQueue: Queue<ReportJobData> | undefined;
  let shutdownWorker: (() => Promise<void>) | undefined;

  if (redisConnection && logger) {
    reportQueue = createQueue(REPORT_QUEUE, redisConnection);
    const worker = createReportWorker({
      connection: redisConnection,
      reports,
      exporter,
      logger,
    });

    worker.on("failed", (job, err) => {
      logger.error(
        { jobId: job?.id, reportId: job?.data.reportId, err },
        "report job failed",
      );
    });

    shutdownWorker = async () => {
      await worker.close();
      await reportQueue!.close();
    };
  }

  return {
    reportQueue,
    shutdownWorker,
    async registerRoutes(fastify) {
      await registerReportRoutes(fastify, { generateReport, getReportStatus });
    },
  };
}
