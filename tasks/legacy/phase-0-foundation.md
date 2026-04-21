# Phase 0 — Foundation & Shared Kernel

Project scaffolding, tooling, and the shared domain/infrastructure primitives that every bounded context will depend on.

## Tooling & Project Setup
- [x] `package.json` — dependencies, scripts (`dev`, `build`, `start`, `test`, `migrate`, `seed`, `lint`)
- [x] `tsconfig.json` / `tsconfig.build.json` — strict, ES2022, CJS output
- [x] `.env.example` — all required environment variables documented
- [x] `.gitignore`
- [ ] `.eslintrc` / `.prettierrc` — code style (deferred — strict `tsc` enforces the critical checks for now)
- [x] `docker-compose.yml` — local Postgres 16 + Redis 7
- [x] `Dockerfile` — multi-stage production build
- [x] `render.yaml` — Render blueprint (web + worker + db)
- [x] `vitest.config.ts`

## Shared Kernel — Domain
- [x] `src/shared/domain/Entity.ts`
- [x] `src/shared/domain/AggregateRoot.ts`
- [x] `src/shared/domain/ValueObject.ts`
- [x] `src/shared/domain/events/DomainEvent.ts`
- [x] `src/shared/domain/events/EventBus.ts` (port)
- [x] `src/shared/domain/errors/DomainError.ts`
- [x] `src/shared/domain/errors/NotFoundError.ts`
- [x] `src/shared/domain/errors/ConflictError.ts`
- [x] `src/shared/domain/errors/ValidationError.ts`
- [x] `src/shared/domain/errors/AuthorizationError.ts` (+ `UnauthenticatedError`)
- [x] `src/shared/domain/value-objects/UniqueId.ts`
- [x] `src/shared/domain/value-objects/Email.ts`
- [x] `src/shared/domain/value-objects/Money.ts`
- [x] `src/shared/domain/value-objects/PhoneNumber.ts`
- [x] `src/shared/domain/value-objects/DateRange.ts`
- [x] `src/shared/domain/value-objects/Slug.ts`

## Shared Kernel — Application
- [x] `src/shared/application/UseCase.ts`
- [x] `src/shared/application/PaginatedQuery.ts`
- [x] `src/shared/application/TransactionManager.ts` (port)

## Shared Kernel — Infrastructure
- [x] `src/shared/infrastructure/config/env.ts` (Zod-validated env)
- [ ] `src/shared/infrastructure/config/container.ts` (tsyringe DI — will wire up as modules arrive)
- [x] `src/shared/infrastructure/logging/pino-logger.ts`
- [x] `src/shared/infrastructure/database/pg-pool.ts`
- [x] `src/shared/infrastructure/database/PgTransactionManager.ts`
- [x] `src/shared/infrastructure/database/BaseRepository.ts`
- [x] `src/shared/infrastructure/database/migrate.ts` (migration runner)
- [x] `src/shared/infrastructure/database/migrations/0001_init_extensions.sql`
- [x] `src/shared/infrastructure/cache/redis-client.ts`
- [x] `src/shared/infrastructure/cache/CachePort.ts`
- [x] `src/shared/infrastructure/cache/RedisCacheAdapter.ts`
- [x] `src/shared/infrastructure/events/InMemoryEventBus.ts`
- [x] `src/shared/infrastructure/http/server.ts` (Fastify bootstrap)
- [x] `src/shared/infrastructure/http/plugins/error-handler.plugin.ts`
- [x] `src/shared/infrastructure/http/plugins/rate-limit.plugin.ts`
- [x] `src/shared/infrastructure/http/plugins/auth.plugin.ts` (stub verifier until Phase 2)
- [x] `src/shared/infrastructure/http/plugins/rbac.plugin.ts`
- [ ] `src/shared/infrastructure/http/middleware/request-id.ts` (handled by Fastify `genReqId`)
- [ ] `src/shared/infrastructure/http/middleware/cors.ts` (registered directly in server.ts)
- [ ] `src/shared/infrastructure/http/middleware/helmet.ts` (registered directly in server.ts)
- [ ] `src/shared/infrastructure/jobs/queue.ts` (BullMQ — deferred to Phase 4)

## Entry Point & Health
- [x] `src/main.ts` — compose root, graceful shutdown (SIGTERM/SIGINT), PG + Redis health checks
- [ ] `src/worker.ts` — BullMQ worker entry (deferred to Phase 4)
- [x] `GET /health` — checks pg + redis

## Tests
- [x] Unit tests for Money, Email, UniqueId, Slug (15 tests passing)
- [ ] Integration smoke test for Fastify bootstrap (deferred — needs testcontainers / running Docker)

## Verification
- [x] `npm install` succeeds
- [x] `npm run build` succeeds (clean TypeScript compile with `strict` + `noUncheckedIndexedAccess`)
- [x] `npm run test` passes shared-kernel tests
- [ ] Runtime smoke test (requires Docker — local Docker daemon not running)
