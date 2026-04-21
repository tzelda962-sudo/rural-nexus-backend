import { FastifyInstance } from "fastify";
import { NotFoundError } from "../../../../../shared/domain/errors/NotFoundError";
import { UnauthenticatedError } from "../../../../../shared/domain/errors/AuthorizationError";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { requirePermissions } from "../../../../../shared/infrastructure/http/plugins/rbac.plugin";
import { RegisterVolunteerUseCase } from "../../../application/use-cases/RegisterVolunteerUseCase";
import { SearchVolunteersUseCase } from "../../../application/use-cases/SearchVolunteersUseCase";
import { UpdateAvailabilityUseCase } from "../../../application/use-cases/UpdateAvailabilityUseCase";
import { AssignVolunteerUseCase } from "../../../application/use-cases/AssignVolunteerUseCase";
import { CompleteAssignmentUseCase } from "../../../application/use-cases/CompleteAssignmentUseCase";
import { WithdrawAssignmentUseCase } from "../../../application/use-cases/WithdrawAssignmentUseCase";
import { toVolunteerResponseDto } from "../../../application/dtos/VolunteerResponseDto";
import { VolunteerRepository } from "../../../domain/ports/outbound/VolunteerRepository";
import { AssignmentRepository } from "../../../domain/ports/outbound/AssignmentRepository";
import {
  registerVolunteerBodySchema,
  searchVolunteersQuerySchema,
  updateAvailabilityBodySchema,
  volunteerParamsSchema,
  assignVolunteerBodySchema,
  assignmentParamsSchema,
  completeAssignmentBodySchema,
} from "./volunteer.schema";
import { zodJson } from "../../../../../shared/infrastructure/http/schema-helper";
import * as R from "../../../../../shared/infrastructure/http/response-schemas";

export interface VolunteerRouteDeps {
  register: RegisterVolunteerUseCase;
  search: SearchVolunteersUseCase;
  updateAvailability: UpdateAvailabilityUseCase;
  assignVolunteer: AssignVolunteerUseCase;
  completeAssignment: CompleteAssignmentUseCase;
  withdrawAssignment: WithdrawAssignmentUseCase;
  volunteers: VolunteerRepository;
  assignments: AssignmentRepository;
}

export async function registerVolunteerRoutes(
  fastify: FastifyInstance,
  deps: VolunteerRouteDeps,
): Promise<void> {
  // ── Authenticated: register myself as a volunteer ─
  fastify.post(
    "/api/v1/volunteers",
    { preHandler: [fastify.authenticate], schema: { tags: ["Volunteers"], description: "Register as a volunteer", security: [{ bearerAuth: [] }], body: zodJson(registerVolunteerBodySchema), response: { 201: zodJson(R.registerVolunteerResponse) } } },
    async (request, reply) => {
      if (!request.user) throw new UnauthenticatedError("No session");
      const body = registerVolunteerBodySchema.parse(request.body);
      const result = await deps.register.execute({
        userId: request.user.userId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        skills: body.skills,
        availability: body.availability,
        notes: body.notes,
      });
      return reply.status(201).send(result);
    },
  );

  // ── Search (staff and above) ──────────────────────
  fastify.get(
    "/api/v1/volunteers",
    {
      preHandler: [fastify.authenticate, requirePermissions("volunteers:read")],
      schema: { tags: ["Volunteers"], description: "Search volunteers", security: [{ bearerAuth: [] }], querystring: zodJson(searchVolunteersQuerySchema), response: { 200: zodJson(R.volunteerListResponse) } },
    },
    async (request) => {
      const query = searchVolunteersQuerySchema.parse(request.query);
      return deps.search.execute({
        pagination: { page: query.page, limit: query.limit },
        filters: {
          status: query.status,
          minHoursPerWeek: query.minHoursPerWeek,
          skills: query.skills,
        },
      });
    },
  );

  // ── Get one volunteer ─────────────────────────────
  fastify.get(
    "/api/v1/volunteers/:volunteerId",
    {
      preHandler: [fastify.authenticate, requirePermissions("volunteers:read")],
      schema: { tags: ["Volunteers"], description: "Get a volunteer by ID", security: [{ bearerAuth: [] }], params: zodJson(volunteerParamsSchema), response: { 200: zodJson(R.volunteerResponse) } },
    },
    async (request) => {
      const params = volunteerParamsSchema.parse(request.params);
      const volunteer = await deps.volunteers.findById(
        UniqueId.fromString(params.volunteerId),
      );
      if (!volunteer) throw new NotFoundError("Volunteer", params.volunteerId);
      return toVolunteerResponseDto(volunteer);
    },
  );

  // ── Update my availability ────────────────────────
  fastify.put(
    "/api/v1/volunteers/:volunteerId/availability",
    { preHandler: [fastify.authenticate], schema: { tags: ["Volunteers"], description: "Update volunteer availability", security: [{ bearerAuth: [] }], params: zodJson(volunteerParamsSchema), body: zodJson(updateAvailabilityBodySchema), response: { 200: zodJson(R.updateAvailabilityResponse) } } },
    async (request) => {
      const params = volunteerParamsSchema.parse(request.params);
      const body = updateAvailabilityBodySchema.parse(request.body);
      if (!request.user) throw new UnauthenticatedError("No session");

      // Volunteers can only update their own row; staff need volunteers:write.
      const volunteer = await deps.volunteers.findById(
        UniqueId.fromString(params.volunteerId),
      );
      if (!volunteer) throw new NotFoundError("Volunteer", params.volunteerId);
      const isOwner = volunteer.userId.value === request.user.userId;
      const canWrite = request.user.permissions.includes("volunteers:write");
      if (!isOwner && !canWrite) {
        throw new NotFoundError("Volunteer", params.volunteerId);
      }

      return deps.updateAvailability.execute({
        volunteerId: params.volunteerId,
        availability: body.availability,
      });
    },
  );

  // ── Auth + volunteers:write: assign volunteer to campaign
  fastify.post(
    "/api/v1/volunteers/:volunteerId/assignments",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("volunteers:write"),
      ],
      schema: { tags: ["Volunteers"], description: "Assign volunteer to a campaign", security: [{ bearerAuth: [] }], params: zodJson(volunteerParamsSchema), body: zodJson(assignVolunteerBodySchema), response: { 201: zodJson(R.assignVolunteerResponse) } },
    },
    async (request, reply) => {
      const params = volunteerParamsSchema.parse(request.params);
      const body = assignVolunteerBodySchema.parse(request.body);
      const result = await deps.assignVolunteer.execute({
        volunteerId: params.volunteerId,
        ...body,
      });
      return reply.status(201).send(result);
    },
  );

  // ── Auth + volunteers:read: list assignments for volunteer
  fastify.get(
    "/api/v1/volunteers/:volunteerId/assignments",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("volunteers:read"),
      ],
      schema: { tags: ["Volunteers"], description: "List assignments for a volunteer", security: [{ bearerAuth: [] }], params: zodJson(volunteerParamsSchema), response: { 200: zodJson(R.assignmentListResponse) } },
    },
    async (request) => {
      const params = volunteerParamsSchema.parse(request.params);
      const assignments = await deps.assignments.findByVolunteer(
        UniqueId.fromString(params.volunteerId),
      );
      return assignments.map((a) => ({
        id: a.id.value,
        volunteerId: a.volunteerId.value,
        campaignId: a.campaignId.value,
        role: a.role,
        startDate: a.startDate.toISOString(),
        endDate: a.endDate?.toISOString() ?? null,
        hoursCommitted: a.hoursCommitted,
        hoursLogged: a.hoursLogged,
        status: a.status,
      }));
    },
  );

  // ── Auth + volunteers:write: complete assignment
  fastify.post(
    "/api/v1/assignments/:assignmentId/complete",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("volunteers:write"),
      ],
      schema: { tags: ["Volunteers"], description: "Complete a volunteer assignment", security: [{ bearerAuth: [] }], params: zodJson(assignmentParamsSchema), body: zodJson(completeAssignmentBodySchema), response: { 204: { type: "null", description: "No content" } } },
    },
    async (request, reply) => {
      const params = assignmentParamsSchema.parse(request.params);
      const body = completeAssignmentBodySchema.parse(request.body);
      await deps.completeAssignment.execute({
        assignmentId: params.assignmentId,
        hoursLogged: body.hoursLogged,
      });
      return reply.status(204).send();
    },
  );

  // ── Auth + volunteers:write: withdraw assignment
  fastify.post(
    "/api/v1/assignments/:assignmentId/withdraw",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("volunteers:write"),
      ],
      schema: { tags: ["Volunteers"], description: "Withdraw a volunteer assignment", security: [{ bearerAuth: [] }], params: zodJson(assignmentParamsSchema), response: { 204: { type: "null", description: "No content" } } },
    },
    async (request, reply) => {
      const params = assignmentParamsSchema.parse(request.params);
      await deps.withdrawAssignment.execute({
        assignmentId: params.assignmentId,
      });
      return reply.status(204).send();
    },
  );
}
