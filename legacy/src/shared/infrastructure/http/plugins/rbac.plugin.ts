import { FastifyReply, FastifyRequest } from "fastify";
import {
  AuthorizationError,
  UnauthenticatedError,
} from "../../../domain/errors/AuthorizationError";

/**
 * Route-level permission guard.
 * Usage:
 *   fastify.route({
 *     method: "POST",
 *     url: "/admin/users/:id/roles",
 *     preHandler: [fastify.authenticate, requirePermissions("users:manage-roles")],
 *     handler: ...
 *   })
 */
export function requirePermissions(
  ...required: string[]
): (req: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (req: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!req.user) {
      throw new UnauthenticatedError("Authentication required");
    }
    const granted = new Set(req.user.permissions);
    for (const perm of required) {
      if (!granted.has(perm)) {
        throw new AuthorizationError(
          `Missing required permission: ${perm}`,
          { required, granted: req.user.permissions },
        );
      }
    }
  };
}

export function requireRoles(
  ...required: string[]
): (req: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (req: FastifyRequest): Promise<void> => {
    if (!req.user) {
      throw new UnauthenticatedError("Authentication required");
    }
    const granted = new Set(req.user.roles);
    const hasAny = required.some((r) => granted.has(r));
    if (!hasAny) {
      throw new AuthorizationError(
        `Requires one of roles: ${required.join(", ")}`,
      );
    }
  };
}
