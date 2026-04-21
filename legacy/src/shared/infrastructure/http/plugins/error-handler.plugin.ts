import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { ZodError } from "zod";
import { DomainError } from "../../../domain/errors/DomainError";

function formatZodError(err: ZodError): Array<{ path: string; message: string }> {
  return err.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

async function plugin(fastify: FastifyInstance): Promise<void> {
  fastify.setErrorHandler((error, request, reply) => {
    const requestId = request.id;

    if (error instanceof ZodError) {
      request.log.warn({ requestId, issues: error.issues }, "validation error");
      return reply.status(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: formatZodError(error),
          requestId,
        },
      });
    }

    if (error instanceof DomainError) {
      request.log.warn(
        { requestId, code: error.code, details: error.details },
        error.message,
      );
      return reply.status(error.httpStatus).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
        },
      });
    }

    // Fastify-native errors (400, 404, 429 rate-limit, etc.)
    const anyErr = error as {
      statusCode?: number;
      code?: string;
      message?: string;
    };
    if (typeof anyErr.statusCode === "number" && anyErr.statusCode < 500) {
      return reply.status(anyErr.statusCode).send({
        error: {
          code: anyErr.code ?? "CLIENT_ERROR",
          message: anyErr.message ?? "Client error",
          requestId,
        },
      });
    }

    request.log.error({ err: error, requestId }, "unhandled error");
    return reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "An internal error occurred",
        requestId,
      },
    });
  });

  fastify.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: {
        code: "NOT_FOUND",
        message: `Route ${request.method} ${request.url} not found`,
        requestId: request.id,
      },
    });
  });
}

export const errorHandlerPlugin = fastifyPlugin(plugin, { name: "error-handler" });
