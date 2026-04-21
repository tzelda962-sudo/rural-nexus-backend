import { FastifyInstance, FastifyRequest } from "fastify";
import { UnauthenticatedError } from "../../../../../shared/domain/errors/AuthorizationError";
import { requirePermissions } from "../../../../../shared/infrastructure/http/plugins/rbac.plugin";
import { LoginUserUseCase } from "../../../application/use-cases/LoginUserUseCase";
import { LogoutUserUseCase } from "../../../application/use-cases/LogoutUserUseCase";
import { RefreshTokenUseCase } from "../../../application/use-cases/RefreshTokenUseCase";
import { RegisterUserUseCase } from "../../../application/use-cases/RegisterUserUseCase";
import { AssignRoleUseCase } from "../../../application/use-cases/AssignRoleUseCase";
import { GetAuditLogsUseCase } from "../../../application/use-cases/GetAuditLogsUseCase";
import {
  assignRoleBodySchema,
  assignRoleParamsSchema,
  auditLogQuerySchema,
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "./auth.schema";
import { zodJson } from "../../../../../shared/infrastructure/http/schema-helper";
import * as R from "../../../../../shared/infrastructure/http/response-schemas";

export interface IamRouteDeps {
  register: RegisterUserUseCase;
  login: LoginUserUseCase;
  refresh: RefreshTokenUseCase;
  logout: LogoutUserUseCase;
  assignRole: AssignRoleUseCase;
  getAuditLogs: GetAuditLogsUseCase;
}

function clientIp(req: FastifyRequest): string {
  return (
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
    req.ip ??
    "unknown"
  );
}

function userAgent(req: FastifyRequest): string {
  return (req.headers["user-agent"] as string | undefined) ?? "unknown";
}

export async function registerIamRoutes(
  fastify: FastifyInstance,
  deps: IamRouteDeps,
): Promise<void> {
  // ── Auth ──────────────────────────────────────
  fastify.post("/api/v1/auth/register", { schema: { tags: ["Auth"], description: "Register a new user account", body: zodJson(registerBodySchema), response: { 201: zodJson(R.registerResponse) } } }, async (request, reply) => {
    const body = registerBodySchema.parse(request.body);
    const result = await deps.register.execute(body);
    return reply.status(201).send(result);
  });

  fastify.post("/api/v1/auth/login", { schema: { tags: ["Auth"], description: "Login with email and password", body: zodJson(loginBodySchema), response: { 200: zodJson(R.loginResponse) } } }, async (request, reply) => {
    const body = loginBodySchema.parse(request.body);
    const result = await deps.login.execute({
      email: body.email,
      password: body.password,
      ipAddress: clientIp(request),
      userAgent: userAgent(request),
    });
    return reply.send(result);
  });

  fastify.post("/api/v1/auth/refresh", { schema: { tags: ["Auth"], description: "Refresh an access token", body: zodJson(refreshBodySchema), response: { 200: zodJson(R.refreshResponse) } } }, async (request, reply) => {
    const body = refreshBodySchema.parse(request.body);
    const result = await deps.refresh.execute({
      refreshToken: body.refreshToken,
      ipAddress: clientIp(request),
      userAgent: userAgent(request),
    });
    return reply.send(result);
  });

  fastify.post("/api/v1/auth/logout", { schema: { tags: ["Auth"], description: "Logout and invalidate refresh token", body: zodJson(logoutBodySchema), response: { 200: zodJson(R.logoutResponse) } } }, async (request, reply) => {
    const body = logoutBodySchema.parse(request.body);
    const result = await deps.logout.execute(body);
    return reply.send(result);
  });

  fastify.get(
    "/api/v1/auth/me",
    { preHandler: [fastify.authenticate], schema: { tags: ["Auth"], description: "Get current user info", security: [{ bearerAuth: [] }], response: { 200: zodJson(R.meResponse) } } },
    async (request) => {
      if (!request.user) throw new UnauthenticatedError("No session");
      return { user: request.user };
    },
  );

  // ── Admin: role assignment ────────────────────
  fastify.put(
    "/api/v1/admin/users/:userId/roles",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("users:manage-roles"),
      ],
      schema: { tags: ["Admin"], description: "Assign a role to a user", security: [{ bearerAuth: [] }], params: zodJson(assignRoleParamsSchema), body: zodJson(assignRoleBodySchema), response: { 200: zodJson(R.assignRoleResponse) } },
    },
    async (request, reply) => {
      const params = assignRoleParamsSchema.parse(request.params);
      const body = assignRoleBodySchema.parse(request.body);
      if (!request.user) throw new UnauthenticatedError("No session");
      const result = await deps.assignRole.execute({
        targetUserId: params.userId,
        roleName: body.roleName,
        actorUserId: request.user.userId,
        actorRoles: request.user.roles,
      });
      return reply.send(result);
    },
  );

  // ── Admin: audit logs ─────────────────────────
  fastify.get(
    "/api/v1/admin/audit-logs",
    {
      preHandler: [fastify.authenticate, requirePermissions("audit:read")],
      schema: { tags: ["Admin"], description: "Query audit logs", security: [{ bearerAuth: [] }], querystring: zodJson(auditLogQuerySchema), response: { 200: zodJson(R.auditLogListResponse) } },
    },
    async (request) => {
      const query = auditLogQuerySchema.parse(request.query);
      return deps.getAuditLogs.execute({
        pagination: { page: query.page, limit: query.limit },
        filters: {
          userId: query.userId,
          action: query.action,
          resource: query.resource,
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
        },
      });
    },
  );
}
