import { FastifyInstance } from "fastify";
import { z } from "zod";
import { UnauthenticatedError } from "../../../../../shared/domain/errors/AuthorizationError";
import { GetDonorProfileUseCase } from "../../../application/use-cases/GetDonorProfileUseCase";
import { UpdateCommunicationPreferencesUseCase } from "../../../application/use-cases/UpdateCommunicationPreferencesUseCase";
import { zodJson } from "../../../../../shared/infrastructure/http/schema-helper";
import * as R from "../../../../../shared/infrastructure/http/response-schemas";

export interface DonorRouteDeps {
  getDonorProfile: GetDonorProfileUseCase;
  updateCommPrefs: UpdateCommunicationPreferencesUseCase;
}

const updatePrefsSchema = z.object({
  receiveNewsletter: z.boolean().optional(),
  receiveUpdates: z.boolean().optional(),
  preferredChannel: z.enum(["EMAIL", "SMS", "IN_APP"]).optional(),
});

export async function registerDonorRoutes(
  fastify: FastifyInstance,
  deps: DonorRouteDeps,
): Promise<void> {
  // ── Auth: get my donor profile ───────────────────
  fastify.get(
    "/api/v1/donor/profile",
    { preHandler: [fastify.authenticate], schema: { tags: ["Donors"], description: "Get my donor profile", security: [{ bearerAuth: [] }], response: { 200: zodJson(R.donorProfileResponse) } } },
    async (request) => {
      if (!request.user) throw new UnauthenticatedError("No session");
      return deps.getDonorProfile.execute(request.user.userId);
    },
  );

  // ── Auth: update communication preferences ───────
  fastify.put(
    "/api/v1/donor/preferences",
    { preHandler: [fastify.authenticate], schema: { tags: ["Donors"], description: "Update communication preferences", security: [{ bearerAuth: [] }], body: zodJson(updatePrefsSchema), response: { 204: { type: "null", description: "No content" } } } },
    async (request, reply) => {
      if (!request.user) throw new UnauthenticatedError("No session");
      const body = updatePrefsSchema.parse(request.body);
      await deps.updateCommPrefs.execute({
        userId: request.user.userId,
        ...body,
      });
      return reply.status(204).send();
    },
  );
}
