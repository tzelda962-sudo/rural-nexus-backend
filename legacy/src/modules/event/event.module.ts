import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { EventBus } from "../../shared/domain/events/EventBus";
import { CreateEventUseCase } from "./application/use-cases/CreateEventUseCase";
import { PublishEventUseCase } from "./application/use-cases/PublishEventUseCase";
import { CancelEventUseCase } from "./application/use-cases/CancelEventUseCase";
import { RegisterAttendeeUseCase } from "./application/use-cases/RegisterAttendeeUseCase";
import { CancelRegistrationUseCase } from "./application/use-cases/CancelRegistrationUseCase";
import { ListEventsUseCase } from "./application/use-cases/ListEventsUseCase";
import { registerEventRoutes } from "./infrastructure/adapters/http/event.routes";
import { PgEventRepository } from "./infrastructure/adapters/persistence/PgEventRepository";
import { PgEventRegistrationRepository } from "./infrastructure/adapters/persistence/PgEventRegistrationRepository";

export interface EventModuleDeps {
  pool: Pool;
  eventBus: EventBus;
  logger: { info: (obj: Record<string, unknown>, msg: string) => void };
}

export interface EventModule {
  registerRoutes: (fastify: FastifyInstance) => Promise<void>;
}

export function createEventModule(deps: EventModuleDeps): EventModule {
  const { pool, eventBus, logger } = deps;

  const events = new PgEventRepository(pool);
  const registrations = new PgEventRegistrationRepository(pool);

  const createEvent = new CreateEventUseCase(events);
  const publishEvent = new PublishEventUseCase(events, eventBus);
  const cancelEvent = new CancelEventUseCase(events, eventBus);
  const registerAttendee = new RegisterAttendeeUseCase(
    events,
    registrations,
    eventBus,
  );
  const cancelRegistration = new CancelRegistrationUseCase(
    events,
    registrations,
  );
  const listEvents = new ListEventsUseCase(events);

  eventBus.subscribe("event.AttendeeRegistered", async (event) => {
    logger.info(
      {
        eventId: event.payload.eventId,
        userId: event.payload.userId,
      },
      "attendee registered — confirmation email queued (noop)",
    );
  });

  eventBus.subscribe("event.EventCancelled", async (event) => {
    logger.info(
      {
        eventId: event.payload.eventId,
        reason: event.payload.reason,
      },
      "event cancelled — attendee notifications queued (noop)",
    );
  });

  return {
    async registerRoutes(fastify) {
      await registerEventRoutes(fastify, {
        createEvent,
        publishEvent,
        cancelEvent,
        registerAttendee,
        cancelRegistration,
        listEvents,
        events,
      });
    },
  };
}
