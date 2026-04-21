import { FastifyInstance } from "fastify";
import { NotFoundError } from "../../../../../shared/domain/errors/NotFoundError";
import { UnauthenticatedError } from "../../../../../shared/domain/errors/AuthorizationError";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { requirePermissions } from "../../../../../shared/infrastructure/http/plugins/rbac.plugin";
import { ConfirmDonationUseCase } from "../../../application/use-cases/ConfirmDonationUseCase";
import { CreateDonationIntentUseCase } from "../../../application/use-cases/CreateDonationIntentUseCase";
import { GetDonationHistoryUseCase } from "../../../application/use-cases/GetDonationHistoryUseCase";
import { RefundDonationUseCase } from "../../../application/use-cases/RefundDonationUseCase";
import { toDonationResponseDto } from "../../../application/dtos/DonationResponseDto";
import { DonationRepository } from "../../../domain/ports/outbound/DonationRepository";
import {
  confirmDonationBodySchema,
  createDonationIntentBodySchema,
  donationHistoryQuerySchema,
  donationParamsSchema,
} from "./donation.schema";
import { zodJson } from "../../../../../shared/infrastructure/http/schema-helper";
import * as R from "../../../../../shared/infrastructure/http/response-schemas";

export interface DonationRouteDeps {
  createIntent: CreateDonationIntentUseCase;
  confirm: ConfirmDonationUseCase;
  history: GetDonationHistoryUseCase;
  refund: RefundDonationUseCase;
  donations: DonationRepository;
}

export async function registerDonationRoutes(
  fastify: FastifyInstance,
  deps: DonationRouteDeps,
): Promise<void> {
  // ── Public: create intent ─────────────────────────
  fastify.post("/api/v1/donations/intent", { schema: { tags: ["Donations"], description: "Create a donation intent", body: zodJson(createDonationIntentBodySchema), response: { 201: zodJson(R.createDonationIntentResponse), 200: zodJson(R.createDonationIntentResponse) } } }, async (request, reply) => {
    const body = createDonationIntentBodySchema.parse(request.body);
    const result = await deps.createIntent.execute({
      donorEmail: body.donorEmail,
      amountCents: body.amountCents,
      currency: body.currency,
      frequency: body.frequency,
      campaignId: body.campaignId,
      paymentMethod: body.paymentMethod,
      idempotencyKey: body.idempotencyKey,
      metadata: body.metadata,
      donorId: request.user?.userId,
    });
    return reply.status(result.reused ? 200 : 201).send(result);
  });

  // ── Public: confirm intent (idempotent) ───────────
  fastify.post(
    "/api/v1/donations/:donationId/confirm",
    { schema: { tags: ["Donations"], description: "Confirm a donation intent (idempotent)", params: zodJson(donationParamsSchema), body: zodJson(confirmDonationBodySchema), response: { 200: zodJson(R.confirmDonationResponse) } } },
    async (request, reply) => {
      const params = donationParamsSchema.parse(request.params);
      const body = confirmDonationBodySchema.parse(request.body);
      const result = await deps.confirm.execute({
        donationId: params.donationId,
        paymentIntentId: body.paymentIntentId,
      });
      return reply.send(result);
    },
  );

  // ── Authenticated: get one donation ───────────────
  fastify.get(
    "/api/v1/donations/:donationId",
    { preHandler: [fastify.authenticate], schema: { tags: ["Donations"], description: "Get a single donation by ID", security: [{ bearerAuth: [] }], params: zodJson(donationParamsSchema), response: { 200: zodJson(R.donationResponse) } } },
    async (request) => {
      const params = donationParamsSchema.parse(request.params);
      const donation = await deps.donations.findById(
        UniqueId.fromString(params.donationId),
      );
      if (!donation) throw new NotFoundError("Donation", params.donationId);

      // Donors can only read their own donations.
      if (!request.user) throw new UnauthenticatedError("No session");
      const isOwner = donation.donorId?.value === request.user.userId;
      const canReadAll = request.user.permissions.includes("donations:read");
      if (!isOwner && !canReadAll) {
        throw new NotFoundError("Donation", params.donationId);
      }

      return toDonationResponseDto(donation);
    },
  );

  // ── Authenticated: list my donations ──────────────
  fastify.get(
    "/api/v1/donations",
    { preHandler: [fastify.authenticate], schema: { tags: ["Donations"], description: "List my donation history", security: [{ bearerAuth: [] }], querystring: zodJson(donationHistoryQuerySchema), response: { 200: zodJson(R.donationListResponse) } } },
    async (request) => {
      if (!request.user) throw new UnauthenticatedError("No session");
      const query = donationHistoryQuerySchema.parse(request.query);
      return deps.history.execute({
        donorId: request.user.userId,
        pagination: { page: query.page, limit: query.limit },
        filters: {
          status: query.status,
          campaignId: query.campaignId,
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
        },
      });
    },
  );

  // ── Admin: refund a donation ──────────────────────
  fastify.post(
    "/api/v1/admin/donations/:donationId/refund",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("donations:refund"),
      ],
      schema: { tags: ["Admin"], description: "Refund a donation", security: [{ bearerAuth: [] }], params: zodJson(donationParamsSchema), response: { 200: zodJson(R.refundDonationResponse) } },
    },
    async (request, reply) => {
      const params = donationParamsSchema.parse(request.params);
      if (!request.user) throw new UnauthenticatedError("No session");
      const result = await deps.refund.execute({
        donationId: params.donationId,
        actorUserId: request.user.userId,
      });
      return reply.send(result);
    },
  );
}
