import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { EventBus } from "../../shared/domain/events/EventBus";
import { RegisterVolunteerUseCase } from "./application/use-cases/RegisterVolunteerUseCase";
import { SearchVolunteersUseCase } from "./application/use-cases/SearchVolunteersUseCase";
import { UpdateAvailabilityUseCase } from "./application/use-cases/UpdateAvailabilityUseCase";
import { AssignVolunteerUseCase } from "./application/use-cases/AssignVolunteerUseCase";
import { CompleteAssignmentUseCase } from "./application/use-cases/CompleteAssignmentUseCase";
import { WithdrawAssignmentUseCase } from "./application/use-cases/WithdrawAssignmentUseCase";
import { registerVolunteerRoutes } from "./infrastructure/adapters/http/volunteer.routes";
import { PgVolunteerRepository } from "./infrastructure/adapters/persistence/PgVolunteerRepository";
import { PgAssignmentRepository } from "./infrastructure/adapters/persistence/PgAssignmentRepository";

export interface VolunteerModuleDeps {
  pool: Pool;
  eventBus: EventBus;
}

export interface VolunteerModule {
  registerRoutes: (fastify: FastifyInstance) => Promise<void>;
}

export function createVolunteerModule(
  deps: VolunteerModuleDeps,
): VolunteerModule {
  const { pool, eventBus } = deps;

  const volunteers = new PgVolunteerRepository(pool);
  const assignments = new PgAssignmentRepository(pool);
  const register = new RegisterVolunteerUseCase(volunteers, eventBus);
  const search = new SearchVolunteersUseCase(volunteers);
  const updateAvailability = new UpdateAvailabilityUseCase(volunteers);
  const assignVolunteer = new AssignVolunteerUseCase(
    volunteers,
    assignments,
    eventBus,
  );
  const completeAssignment = new CompleteAssignmentUseCase(
    assignments,
    volunteers,
  );
  const withdrawAssignment = new WithdrawAssignmentUseCase(assignments);

  return {
    async registerRoutes(fastify) {
      await registerVolunteerRoutes(fastify, {
        register,
        search,
        updateAvailability,
        assignVolunteer,
        completeAssignment,
        withdrawAssignment,
        volunteers,
        assignments,
      });
    },
  };
}
