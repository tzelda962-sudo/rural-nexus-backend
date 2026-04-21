import { FastifyInstance } from "fastify";
import { z } from "zod";
import { requirePermissions } from "../../../../../shared/infrastructure/http/plugins/rbac.plugin";
import { zodJson } from "../../../../../shared/infrastructure/http/schema-helper";
import * as R from "../../../../../shared/infrastructure/http/response-schemas";
import { EnrollBeneficiaryUseCase } from "../../../application/use-cases/EnrollBeneficiaryUseCase";
import { AssignBeneficiaryToProgramUseCase } from "../../../application/use-cases/AssignBeneficiaryToProgramUseCase";
import { CreateProgramUseCase } from "../../../application/use-cases/CreateProgramUseCase";
import { ListProgramsUseCase } from "../../../application/use-cases/ListProgramsUseCase";
import { BeneficiaryRepository } from "../../../domain/ports/outbound/BeneficiaryRepository";

export interface BeneficiaryRouteDeps {
  enrollBeneficiary: EnrollBeneficiaryUseCase;
  createProgram: CreateProgramUseCase;
  assignToProgram: AssignBeneficiaryToProgramUseCase;
  listPrograms: ListProgramsUseCase;
  beneficiaries: BeneficiaryRepository;
}

const enrollSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().date().optional(),
  location: z.string().min(1).max(255),
  notes: z.string().max(2000).optional(),
});

const createProgramSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  campaignId: z.string().uuid().optional(),
  capacity: z.number().int().min(1),
});

const assignSchema = z.object({
  programId: z.string().uuid(),
});

const beneficiaryParamsSchema = z.object({
  beneficiaryId: z.string().uuid(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["ACTIVE", "GRADUATED", "INACTIVE"]).optional(),
  programId: z.string().uuid().optional(),
});

export async function registerBeneficiaryRoutes(
  fastify: FastifyInstance,
  deps: BeneficiaryRouteDeps,
): Promise<void> {
  // ── Auth + beneficiaries:write: enroll beneficiary
  fastify.post(
    "/api/v1/beneficiaries",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("beneficiaries:write"),
      ],
      schema: { tags: ["Beneficiaries"], description: "Enroll a new beneficiary", security: [{ bearerAuth: [] }], body: zodJson(enrollSchema), response: { 201: zodJson(R.enrollBeneficiaryResponse) } },
    },
    async (request, reply) => {
      const body = enrollSchema.parse(request.body);
      const result = await deps.enrollBeneficiary.execute(body);
      return reply.status(201).send(result);
    },
  );

  // ── Auth + beneficiaries:read: list beneficiaries
  fastify.get(
    "/api/v1/beneficiaries",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("beneficiaries:read"),
      ],
      schema: { tags: ["Beneficiaries"], description: "List beneficiaries", security: [{ bearerAuth: [] }], querystring: zodJson(listQuerySchema), response: { 200: zodJson(R.beneficiaryListResponse) } },
    },
    async (request) => {
      const query = listQuerySchema.parse(request.query);
      return deps.beneficiaries.findAll(
        { page: query.page, limit: query.limit },
        { status: query.status, programId: query.programId },
      );
    },
  );

  // ── Auth + beneficiaries:write: assign to program
  fastify.post(
    "/api/v1/beneficiaries/:beneficiaryId/programs",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("beneficiaries:write"),
      ],
      schema: { tags: ["Beneficiaries"], description: "Assign beneficiary to a program", security: [{ bearerAuth: [] }], params: zodJson(beneficiaryParamsSchema), body: zodJson(assignSchema), response: { 204: { type: "null", description: "No content" } } },
    },
    async (request, reply) => {
      const params = beneficiaryParamsSchema.parse(request.params);
      const body = assignSchema.parse(request.body);
      await deps.assignToProgram.execute({
        beneficiaryId: params.beneficiaryId,
        programId: body.programId,
      });
      return reply.status(204).send();
    },
  );

  // ── Auth + programs:write: create program
  fastify.post(
    "/api/v1/programs",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("programs:write"),
      ],
      schema: { tags: ["Beneficiaries"], description: "Create a program", security: [{ bearerAuth: [] }], body: zodJson(createProgramSchema), response: { 201: zodJson(R.createProgramResponse) } },
    },
    async (request, reply) => {
      const body = createProgramSchema.parse(request.body);
      const result = await deps.createProgram.execute(body);
      return reply.status(201).send(result);
    },
  );

  // ── Auth + programs:read: list programs
  fastify.get(
    "/api/v1/programs",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("programs:read"),
      ],
      schema: { tags: ["Beneficiaries"], description: "List programs", security: [{ bearerAuth: [] }], response: { 200: zodJson(R.programListResponse) } },
    },
    async () => {
      return deps.listPrograms.execute();
    },
  );
}
