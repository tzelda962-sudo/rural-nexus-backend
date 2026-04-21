import { FastifyInstance } from "fastify";
import { ProcessPaymentWebhookUseCase } from "../../../application/use-cases/ProcessPaymentWebhookUseCase";
import { zodJson } from "../../../../../shared/infrastructure/http/schema-helper";
import * as R from "../../../../../shared/infrastructure/http/response-schemas";

export interface WebhookRouteDeps {
  processWebhook: ProcessPaymentWebhookUseCase;
}

export async function registerWebhookRoutes(
  fastify: FastifyInstance,
  deps: WebhookRouteDeps,
): Promise<void> {
  fastify.post("/api/v1/webhooks/payment", { schema: { tags: ["Webhooks"], description: "Stripe payment webhook", response: { 200: zodJson(R.webhookResponse), 400: zodJson(R.errorResponse) } } }, async (request, reply) => {
    const signature =
      (request.headers["stripe-signature"] as string) ?? "";
    const payload = request.body as Record<string, unknown>;

    const eventType = (payload.type as string) ?? "unknown";
    const idempotencyKey = (payload.id as string) ?? "";

    if (!idempotencyKey) {
      return reply.status(400).send({ error: "Missing event ID" });
    }

    const result = await deps.processWebhook.execute({
      provider: "stripe",
      eventType,
      payload,
      signature,
      idempotencyKey,
      receivedAt: new Date(),
    });

    return reply.send(result);
  });
}
