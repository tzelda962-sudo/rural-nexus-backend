import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import compress from "@fastify/compress";
import Fastify, { FastifyInstance } from "fastify";
import { Redis } from "ioredis";
import { Pool } from "pg";
import { Logger } from "pino";
import { Env, getCorsOrigins } from "../config/env";
import { errorHandlerPlugin } from "./plugins/error-handler.plugin";
import { authPlugin, TokenVerifier } from "./plugins/auth.plugin";
import { registerRateLimit } from "./plugins/rate-limit.plugin";
import { registerSwagger } from "./plugins/swagger.plugin";
import { zodJson } from "./schema-helper";
import * as R from "./response-schemas";

export interface ServerDependencies {
  env: Env;
  logger: Logger;
  pgPool: Pool;
  redis: Redis;
  tokenVerifier: TokenVerifier | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildServer(
  deps: ServerDependencies,
): Promise<FastifyInstance<any, any, any, any>> {
  const { env, logger, pgPool, redis, tokenVerifier } = deps;

  const fastify = Fastify({
    loggerInstance: logger,
    genReqId: (req) =>
      (req.headers["x-request-id"] as string | undefined) ??
      crypto.randomUUID(),
    disableRequestLogging: false,
    trustProxy: true,
    bodyLimit: 1_048_576, // 1 MB
  });

  // ── Security headers ────────────────────────────
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // API doesn't serve HTML
  });

  // ── CORS ────────────────────────────────────────
  await fastify.register(cors, {
    origin: getCorsOrigins(env),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  });

  // ── Compression ─────────────────────────────────
  await fastify.register(compress, { global: true, encodings: ["gzip", "deflate"] });

  // ── Rate limiting ───────────────────────────────
  await registerRateLimit(fastify as any, env, redis);

  // ── Swagger / OpenAPI docs ─────────────────────
  await registerSwagger(fastify as any);

  // ── Error handler (must be registered before routes) ──
  await fastify.register(errorHandlerPlugin);

  // ── Auth decorator ──────────────────────────────
  await fastify.register(authPlugin, { verifier: tokenVerifier });

  // ── Health check ────────────────────────────────
  fastify.get("/health", { schema: { tags: ["System"], description: "Health check — verifies Postgres and Redis connectivity", response: { 200: zodJson(R.healthResponse) } } }, async () => {
    const checks = { postgres: "unknown", redis: "unknown" } as Record<
      string,
      string
    >;

    try {
      await pgPool.query("SELECT 1");
      checks.postgres = "ok";
    } catch {
      checks.postgres = "down";
    }

    try {
      const pong = await redis.ping();
      checks.redis = pong === "PONG" ? "ok" : "degraded";
    } catch {
      checks.redis = "down";
    }

    const healthy = checks.postgres === "ok" && checks.redis === "ok";
    return {
      status: healthy ? "ok" : "degraded",
      uptimeSeconds: Math.round(process.uptime()),
      checks,
      version: process.env.npm_package_version ?? "0.0.0",
    };
  });

  fastify.get("/", { schema: { tags: ["System"], description: "API root" } }, async () => ({
    name: "ngo-platform-api",
    status: "ok",
  }));

  return fastify;
}
