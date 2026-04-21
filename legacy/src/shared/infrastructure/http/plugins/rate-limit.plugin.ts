import rateLimit from "@fastify/rate-limit";
import { FastifyInstance } from "fastify";
import { Redis } from "ioredis";
import { Env } from "../../config/env";

export async function registerRateLimit(
  fastify: FastifyInstance,
  env: Env,
  redis: Redis,
): Promise<void> {
  await fastify.register(rateLimit, {
    global: true,
    max: env.RATE_LIMIT_GLOBAL_PER_MIN,
    timeWindow: "1 minute",
    redis,
    keyGenerator: (req) => (req.ip ?? "unknown"),
    errorResponseBuilder: (_req, context) => ({
      error: {
        code: "RATE_LIMITED",
        message: `Too many requests. Retry in ${context.after}.`,
        retryAfterSeconds: Math.ceil(context.ttl / 1000),
      },
    }),
  });
}
