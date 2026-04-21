import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { AssignBeneficiaryToProgramUseCase } from "./application/use-cases/AssignBeneficiaryToProgramUseCase";
import { CreateProgramUseCase } from "./application/use-cases/CreateProgramUseCase";
import { EnrollBeneficiaryUseCase } from "./application/use-cases/EnrollBeneficiaryUseCase";
import { ListProgramsUseCase } from "./application/use-cases/ListProgramsUseCase";
import { registerBeneficiaryRoutes } from "./infrastructure/adapters/http/beneficiary.routes";
import { PgBeneficiaryRepository } from "./infrastructure/adapters/persistence/PgBeneficiaryRepository";
import { PgProgramRepository } from "./infrastructure/adapters/persistence/PgProgramRepository";

export interface BeneficiaryModuleDeps {
  pool: Pool;
}

export interface BeneficiaryModule {
  registerRoutes: (fastify: FastifyInstance) => Promise<void>;
}

export function createBeneficiaryModule(
  deps: BeneficiaryModuleDeps,
): BeneficiaryModule {
  const { pool } = deps;

  const beneficiaries = new PgBeneficiaryRepository(pool);
  const programs = new PgProgramRepository(pool);

  const enrollBeneficiary = new EnrollBeneficiaryUseCase(beneficiaries);
  const createProgram = new CreateProgramUseCase(programs);
  const assignToProgram = new AssignBeneficiaryToProgramUseCase(
    beneficiaries,
    programs,
  );
  const listPrograms = new ListProgramsUseCase(programs);

  return {
    async registerRoutes(fastify) {
      await registerBeneficiaryRoutes(fastify, {
        enrollBeneficiary,
        createProgram,
        assignToProgram,
        listPrograms,
        beneficiaries,
      });
    },
  };
}
