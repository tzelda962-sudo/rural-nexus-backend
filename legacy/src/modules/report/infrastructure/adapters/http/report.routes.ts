import { FastifyInstance } from "fastify";
import { UnauthenticatedError } from "../../../../../shared/domain/errors/AuthorizationError";
import { requirePermissions } from "../../../../../shared/infrastructure/http/plugins/rbac.plugin";
import { GenerateReportUseCase } from "../../../application/use-cases/GenerateReportUseCase";
import { GetReportStatusUseCase } from "../../../application/use-cases/GetReportStatusUseCase";
import {
  generateReportBodySchema,
  reportParamsSchema,
} from "./report.schema";
import { zodJson } from "../../../../../shared/infrastructure/http/schema-helper";
import * as R from "../../../../../shared/infrastructure/http/response-schemas";

export interface ReportRouteDeps {
  generateReport: GenerateReportUseCase;
  getReportStatus: GetReportStatusUseCase;
}

export async function registerReportRoutes(
  fastify: FastifyInstance,
  deps: ReportRouteDeps,
): Promise<void> {
  // ── Auth + reports:generate: request a report ────
  fastify.post(
    "/api/v1/reports",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("reports:generate"),
      ],
      schema: { tags: ["Reports"], description: "Request a new report", security: [{ bearerAuth: [] }], body: zodJson(generateReportBodySchema), response: { 202: zodJson(R.generateReportResponse) } },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthenticatedError("No session");
      const body = generateReportBodySchema.parse(request.body);
      const result = await deps.generateReport.execute({
        type: body.type,
        format: body.format,
        dateFrom: body.dateFrom,
        dateTo: body.dateTo,
        campaignIds: body.campaignIds,
        generatedBy: request.user.userId,
      });
      return reply.status(202).send(result);
    },
  );

  // ── Auth: check report status ────────────────────
  fastify.get(
    "/api/v1/reports/:reportId",
    { preHandler: [fastify.authenticate], schema: { tags: ["Reports"], description: "Check report generation status", security: [{ bearerAuth: [] }], params: zodJson(reportParamsSchema), response: { 200: zodJson(R.reportStatusResponse) } } },
    async (request) => {
      const params = reportParamsSchema.parse(request.params);
      return deps.getReportStatus.execute(params.reportId);
    },
  );
}
