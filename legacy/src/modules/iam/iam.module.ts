import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { Redis } from "ioredis";
import { EventBus } from "../../shared/domain/events/EventBus";
import { Env, normalizePemKey } from "../../shared/infrastructure/config/env";
import { AssignRoleUseCase } from "./application/use-cases/AssignRoleUseCase";
import { GetAuditLogsUseCase } from "./application/use-cases/GetAuditLogsUseCase";
import { LoginUserUseCase } from "./application/use-cases/LoginUserUseCase";
import { LogoutUserUseCase } from "./application/use-cases/LogoutUserUseCase";
import { RefreshTokenUseCase } from "./application/use-cases/RefreshTokenUseCase";
import { RegisterUserUseCase } from "./application/use-cases/RegisterUserUseCase";
import { BcryptPasswordHasher } from "./infrastructure/adapters/external/BcryptPasswordHasher";
import { JwtTokenService } from "./infrastructure/adapters/external/JwtTokenService";
import { registerIamRoutes } from "./infrastructure/adapters/http/auth.routes";
import { PgAuditLogRepository } from "./infrastructure/adapters/persistence/PgAuditLogRepository";
import { PgRoleRepository } from "./infrastructure/adapters/persistence/PgRoleRepository";
import { PgUserRepository } from "./infrastructure/adapters/persistence/PgUserRepository";

export interface IamModuleDeps {
  env: Env;
  pool: Pool;
  redis: Redis;
  eventBus: EventBus;
}

export interface IamModule {
  tokenService: JwtTokenService;
  registerRoutes: (fastify: FastifyInstance) => Promise<void>;
}

export function createIamModule(deps: IamModuleDeps): IamModule {
  const { env, pool, redis, eventBus } = deps;

  const privateKey = normalizePemKey(env.JWT_PRIVATE_KEY);
  const publicKey = normalizePemKey(env.JWT_PUBLIC_KEY);
  if (!privateKey || !publicKey) {
    throw new Error(
      "IAM module requires JWT_PRIVATE_KEY and JWT_PUBLIC_KEY. " +
        "Generate an RSA key pair with: " +
        "openssl genrsa -out private.pem 2048 && openssl rsa -in private.pem -pubout -out public.pem",
    );
  }

  const users = new PgUserRepository(pool);
  const roles = new PgRoleRepository(pool);
  const auditLog = new PgAuditLogRepository(pool);
  const hasher = new BcryptPasswordHasher(12);
  const tokenService = new JwtTokenService(
    {
      privateKey,
      publicKey,
      accessTtlSeconds: env.JWT_ACCESS_TTL_SECONDS,
      refreshTtlSeconds: env.JWT_REFRESH_TTL_SECONDS,
      issuer: env.JWT_ISSUER,
    },
    redis,
  );

  const register = new RegisterUserUseCase(users, roles, hasher, eventBus);
  const login = new LoginUserUseCase(users, hasher, tokenService, eventBus);
  const refresh = new RefreshTokenUseCase(users, tokenService);
  const logout = new LogoutUserUseCase(tokenService);
  const assignRole = new AssignRoleUseCase(users, roles, auditLog, eventBus);
  const getAuditLogs = new GetAuditLogsUseCase(auditLog);

  return {
    tokenService,
    async registerRoutes(fastify) {
      await registerIamRoutes(fastify, {
        register,
        login,
        refresh,
        logout,
        assignRole,
        getAuditLogs,
      });
    },
  };
}
