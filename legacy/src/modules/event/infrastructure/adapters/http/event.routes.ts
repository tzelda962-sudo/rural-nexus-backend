import { FastifyInstance } from "fastify";
import { requirePermissions } from "../../../../../shared/infrastructure/http/plugins/rbac.plugin";
import { NotFoundError } from "../../../../../shared/domain/errors/NotFoundError";
import { Slug } from "../../../../../shared/domain/value-objects/Slug";
import { CreateEventUseCase } from "../../../application/use-cases/CreateEventUseCase";
import { PublishEventUseCase } from "../../../application/use-cases/PublishEventUseCase";
import { CancelEventUseCase } from "../../../application/use-cases/CancelEventUseCase";
import { RegisterAttendeeUseCase } from "../../../application/use-cases/RegisterAttendeeUseCase";
import { CancelRegistrationUseCase } from "../../../application/use-cases/CancelRegistrationUseCase";
import { ListEventsUseCase } from "../../../application/use-cases/ListEventsUseCase";
import { EventRepository } from "../../../domain/ports/outbound/EventRepository";
import {
  createEventBodySchema,
  eventParamsSchema,
  eventSlugParamsSchema,
  cancelEventBodySchema,
  listEventsQuerySchema,
} from "./event.schema";
import { zodJson } from "../../../../../shared/infrastructure/http/schema-helper";
import * as R from "../../../../../shared/infrastructure/http/response-schemas";

export interface EventRouteDeps {
  createEvent: CreateEventUseCase;
  publishEvent: PublishEventUseCase;
  cancelEvent: CancelEventUseCase;
  registerAttendee: RegisterAttendeeUseCase;
  cancelRegistration: CancelRegistrationUseCase;
  listEvents: ListEventsUseCase;
  events: EventRepository;
}

export async function registerEventRoutes(
  fastify: FastifyInstance,
  deps: EventRouteDeps,
): Promise<void> {
  // ── Auth + events:write: create event
  fastify.post(
    "/api/v1/events",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("events:write"),
      ],
      schema: { tags: ["Events"], description: "Create a new event", security: [{ bearerAuth: [] }], body: zodJson(createEventBodySchema), response: { 201: zodJson(R.createEventResponse) } },
    },
    async (request, reply) => {
      const body = createEventBodySchema.parse(request.body);
      const result = await deps.createEvent.execute({
        ...body,
        createdBy: request.user!.userId,
      });
      return reply.status(201).send(result);
    },
  );

  // ── Public: list events
  fastify.get("/api/v1/events", { schema: { tags: ["Events"], description: "List events (public)", querystring: zodJson(listEventsQuerySchema), response: { 200: zodJson(R.eventListResponse) } } }, async (request) => {
    const query = listEventsQuerySchema.parse(request.query);
    return deps.listEvents.execute(
      { page: query.page, limit: query.limit },
      { type: query.type, status: query.status },
    );
  });

  // ── Public: get event by slug
  fastify.get("/api/v1/events/:slug", { schema: { tags: ["Events"], description: "Get event by slug (public)", params: zodJson(eventSlugParamsSchema), response: { 200: zodJson(R.eventDetailResponse) } } }, async (request) => {
    const { slug } = eventSlugParamsSchema.parse(request.params);
    const event = await deps.events.findBySlug(Slug.create(slug));
    if (!event) throw new NotFoundError("Event", slug);
    return {
      id: event.id.value,
      title: event.title,
      slug: event.slug.value,
      description: event.description,
      type: event.type,
      campaignId: event.campaignId?.value ?? null,
      location: event.location.toJSON(),
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      maxAttendees: event.maxAttendees,
      registrationCount: event.registrationCount,
      availableSlots: event.availableSlots,
      status: event.status,
      createdAt: event.createdAt.toISOString(),
    };
  });

  // ── Auth + events:write: publish event
  fastify.post(
    "/api/v1/events/:eventId/publish",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("events:write"),
      ],
      schema: { tags: ["Events"], description: "Publish an event", security: [{ bearerAuth: [] }], params: zodJson(eventParamsSchema), response: { 204: { type: "null", description: "No content" } } },
    },
    async (request, reply) => {
      const { eventId } = eventParamsSchema.parse(request.params);
      await deps.publishEvent.execute({ eventId });
      return reply.status(204).send();
    },
  );

  // ── Auth + events:write: cancel event
  fastify.post(
    "/api/v1/events/:eventId/cancel",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("events:write"),
      ],
      schema: { tags: ["Events"], description: "Cancel an event", security: [{ bearerAuth: [] }], params: zodJson(eventParamsSchema), body: zodJson(cancelEventBodySchema), response: { 204: { type: "null", description: "No content" } } },
    },
    async (request, reply) => {
      const { eventId } = eventParamsSchema.parse(request.params);
      const body = cancelEventBodySchema.parse(request.body);
      await deps.cancelEvent.execute({ eventId, reason: body.reason });
      return reply.status(204).send();
    },
  );

  // ── Auth: register for event
  fastify.post(
    "/api/v1/events/:eventId/register",
    { preHandler: [fastify.authenticate], schema: { tags: ["Events"], description: "Register for an event", security: [{ bearerAuth: [] }], params: zodJson(eventParamsSchema), response: { 201: zodJson(R.registerAttendeeResponse) } } },
    async (request, reply) => {
      const { eventId } = eventParamsSchema.parse(request.params);
      const result = await deps.registerAttendee.execute({
        eventId,
        userId: request.user!.userId,
      });
      return reply.status(201).send(result);
    },
  );

  // ── Auth: cancel own registration
  fastify.delete(
    "/api/v1/events/:eventId/register",
    { preHandler: [fastify.authenticate], schema: { tags: ["Events"], description: "Cancel event registration", security: [{ bearerAuth: [] }], params: zodJson(eventParamsSchema), response: { 204: { type: "null", description: "No content" } } } },
    async (request, reply) => {
      const { eventId } = eventParamsSchema.parse(request.params);
      await deps.cancelRegistration.execute({
        eventId,
        userId: request.user!.userId,
      });
      return reply.status(204).send();
    },
  );
}
