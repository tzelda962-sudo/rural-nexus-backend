import { FastifyInstance, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { UnauthenticatedError } from "../../../domain/errors/AuthorizationError";

export interface AuthenticatedUser {
  userId: string;
  roles: string[];
  permissions: string[];
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

export interface TokenVerifier {
  verifyAccessToken(token: string): {
    userId: string;
    roles: string[];
    permissions: string[];
  };
}

async function plugin(
  fastify: FastifyInstance,
  opts: { verifier: TokenVerifier | null },
): Promise<void> {
  fastify.decorateRequest("user", undefined);

  fastify.decorate("authenticate", async (request: FastifyRequest) => {
    if (!opts.verifier) {
      throw new UnauthenticatedError("Authentication not configured");
    }
    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthenticatedError("Missing or invalid Authorization header");
    }
    const token = header.slice(7).trim();
    try {
      const claims = opts.verifier.verifyAccessToken(token);
      request.user = claims;
    } catch {
      throw new UnauthenticatedError("Invalid or expired access token");
    }
  });
}

export const authPlugin = fastifyPlugin(plugin, { name: "auth" });
