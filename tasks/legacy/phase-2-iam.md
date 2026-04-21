# Phase 2 — Identity & Access Management

## IAM Module — Domain
- [x] `entities/User.ts` (aggregate — register/login/lock/verifyEmail)
- [x] `entities/Role.ts`
- [x] `entities/AuditLogEntry.ts`
- [x] `value-objects/HashedPassword.ts`
- [x] `value-objects/Permission.ts`
- [ ] `value-objects/SessionToken.ts` (deferred — opaque refresh handled by JwtTokenService directly)
- [x] `value-objects/RoleName.ts`
- [x] `events/UserCreated.ts`
- [x] `events/UserLoggedIn.ts`
- [x] `events/PermissionChanged.ts`
- [x] `ports/inbound/LoginUser.ts`
- [x] `ports/inbound/RegisterUser.ts`
- [x] `ports/inbound/RefreshToken.ts`
- [x] `ports/inbound/AssignRole.ts`
- [x] `ports/inbound/GetAuditLogs.ts`
- [x] `ports/outbound/UserRepository.ts`
- [x] `ports/outbound/TokenService.ts`
- [x] `ports/outbound/PasswordHasher.ts`
- [x] `ports/outbound/AuditLogRepository.ts`
- [x] `ports/outbound/RoleRepository.ts`

## IAM Module — Application
- [x] `use-cases/LoginUserUseCase.ts` (account lockout after 5 failed attempts)
- [x] `use-cases/RegisterUserUseCase.ts`
- [x] `use-cases/RefreshTokenUseCase.ts` (token rotation)
- [x] `use-cases/LogoutUserUseCase.ts`
- [x] `use-cases/AssignRoleUseCase.ts`
- [x] `use-cases/GetAuditLogsUseCase.ts`
- [x] DTOs co-located with inbound ports (LoginInput/Output, RegisterInput/Output, etc.)

## IAM Module — Infrastructure
- [x] `adapters/http/auth.routes.ts` (register, login, refresh, logout, /me, admin role assignment, audit logs)
- [x] `adapters/http/auth.schema.ts` (Zod)
- [x] `adapters/persistence/PgUserRepository.ts` (transactional save + role sync)
- [x] `adapters/persistence/PgRoleRepository.ts`
- [x] `adapters/persistence/PgAuditLogRepository.ts`
- [x] `adapters/persistence/user.mapper.ts`
- [x] `adapters/external/BcryptPasswordHasher.ts`
- [x] `adapters/external/JwtTokenService.ts` (RS256, Redis-backed refresh)
- [x] `iam.module.ts` (composition factory)
- [x] SQL migration `0002_iam.sql`: `users`, `roles`, `user_roles`, `audit_logs` + indexes
- [x] Seed default roles (SUPER_ADMIN, ADMIN, STAFF, VOLUNTEER, DONOR)

## Shared Infrastructure — Auth Plugins
- [x] Wire `auth.plugin.ts` to verify access tokens (TokenVerifier from IAM module)
- [x] Wire `rbac.plugin.ts` to enforce required permissions per route
- [x] Wire IAM module into composition root `src/main.ts`

## Tests
- [x] Unit: User aggregate — register, lockout at 5 attempts, lockout expiry, role dedupe, deactivation, password reset clears lock
- [x] Unit: LoginUserUseCase — success, unknown email, bad password increments counter, lockout after 5, deactivated rejection
- [x] Unit: RefreshTokenUseCase rotates refresh token (drop old, issue new) + deactivated revokes
- [x] Unit: AssignRoleUseCase SUPER_ADMIN guardrail (only SUPER_ADMIN can grant SUPER_ADMIN/ADMIN), PUBLIC rejected, NotFound
- [x] Unit: RBAC `requirePermissions` and `requireRoles` guards (allow/deny/unauthenticated)
- [ ] Integration: PgUserRepository CRUD + password hash round-trip (testcontainers — deferred, needs Docker)
- [ ] E2E: register → login → refresh → protected route (deferred — needs running server)
- [ ] E2E: staff cannot assign SUPER_ADMIN (deferred — needs running server)
