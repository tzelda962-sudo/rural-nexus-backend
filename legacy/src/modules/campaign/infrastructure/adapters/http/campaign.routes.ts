import { FastifyInstance } from "fastify";
import { UnauthenticatedError } from "../../../../../shared/domain/errors/AuthorizationError";
import { NotFoundError } from "../../../../../shared/domain/errors/NotFoundError";
import { Slug } from "../../../../../shared/domain/value-objects/Slug";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { requirePermissions } from "../../../../../shared/infrastructure/http/plugins/rbac.plugin";
import { CreateCampaignUseCase } from "../../../application/use-cases/CreateCampaignUseCase";
import { GetAggregateMetricsUseCase } from "../../../application/use-cases/GetAggregateMetricsUseCase";
import { ListPublicCampaignsUseCase } from "../../../application/use-cases/ListPublicCampaignsUseCase";
import { PublishCampaignUseCase } from "../../../application/use-cases/PublishCampaignUseCase";
import { RecordMetricUseCase } from "../../../application/use-cases/RecordMetricUseCase";
import { UpdateCampaignUseCase } from "../../../application/use-cases/UpdateCampaignUseCase";
import { toMetricAggregateResponseDto } from "../../../application/dtos/MetricAggregateDto";
import { CampaignRepository } from "../../../domain/ports/outbound/CampaignRepository";
import {
  adminListCampaignsQuerySchema,
  aggregateMetricsQuerySchema,
  campaignParamsSchema,
  campaignSlugParamsSchema,
  createCampaignBodySchema,
  listCampaignsQuerySchema,
  recordMetricBodySchema,
  updateCampaignBodySchema,
} from "./campaign.schema";
import { zodJson } from "../../../../../shared/infrastructure/http/schema-helper";
import * as R from "../../../../../shared/infrastructure/http/response-schemas";

export interface CampaignRouteDeps {
  createCampaign: CreateCampaignUseCase;
  updateCampaign: UpdateCampaignUseCase;
  publishCampaign: PublishCampaignUseCase;
  recordMetric: RecordMetricUseCase;
  getAggregateMetrics: GetAggregateMetricsUseCase;
  listPublicCampaigns: ListPublicCampaignsUseCase;
  campaigns: CampaignRepository;
}

export async function registerCampaignRoutes(
  fastify: FastifyInstance,
  deps: CampaignRouteDeps,
): Promise<void> {
  // ── Auth + campaigns:write: create campaign ──────
  fastify.post(
    "/api/v1/campaigns",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("campaigns:write"),
      ],
      schema: { tags: ["Campaigns"], description: "Create a new campaign", security: [{ bearerAuth: [] }], body: zodJson(createCampaignBodySchema), response: { 201: zodJson(R.createCampaignResponse) } },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthenticatedError("No session");
      const body = createCampaignBodySchema.parse(request.body);
      const result = await deps.createCampaign.execute({
        title: body.title,
        description: body.description,
        fundingGoalCents: body.fundingGoalCents,
        currency: body.currency,
        isFlexibleGoal: body.isFlexibleGoal,
        startDate: body.startDate,
        endDate: body.endDate,
        tags: body.tags,
        createdBy: request.user.userId,
      });
      return reply.status(201).send(result);
    },
  );

  // ── Public: list published campaigns ─────────────
  fastify.get("/api/v1/campaigns", { schema: { tags: ["Campaigns"], description: "List published campaigns", querystring: zodJson(listCampaignsQuerySchema), response: { 200: zodJson(R.campaignListResponse) } } }, async (request, reply) => {
    const query = listCampaignsQuerySchema.parse(request.query);
    const result = await deps.listPublicCampaigns.execute({
      page: query.page,
      limit: query.limit,
      tag: query.tag,
      status: query.status,
      sort: query.sort,
    });
    return reply.send(result);
  });

  // ── Auth + campaigns:write: update campaign ──────
  fastify.put(
    "/api/v1/campaigns/:campaignId",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("campaigns:write"),
      ],
      schema: { tags: ["Campaigns"], description: "Update a campaign", security: [{ bearerAuth: [] }], params: zodJson(campaignParamsSchema), body: zodJson(updateCampaignBodySchema), response: { 204: { type: "null", description: "No content" } } },
    },
    async (request, reply) => {
      const params = campaignParamsSchema.parse(request.params);
      const body = updateCampaignBodySchema.parse(request.body);
      await deps.updateCampaign.execute({
        campaignId: params.campaignId,
        title: body.title,
        description: body.description,
        endDate: body.endDate,
      });
      return reply.status(204).send();
    },
  );

  // ── Auth + campaigns:publish: publish campaign ───
  fastify.post(
    "/api/v1/campaigns/:campaignId/publish",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("campaigns:publish"),
      ],
      schema: { tags: ["Campaigns"], description: "Publish a campaign", security: [{ bearerAuth: [] }], params: zodJson(campaignParamsSchema), response: { 200: zodJson(R.publishCampaignResponse) } },
    },
    async (request, reply) => {
      const params = campaignParamsSchema.parse(request.params);
      await deps.publishCampaign.execute(params.campaignId);
      return reply.status(200).send({ published: true });
    },
  );

  // ── Auth + campaigns:write: record impact metric ─
  fastify.post(
    "/api/v1/campaigns/:campaignId/metrics",
    {
      preHandler: [
        fastify.authenticate,
        requirePermissions("campaigns:write"),
      ],
      schema: { tags: ["Campaigns"], description: "Record an impact metric", security: [{ bearerAuth: [] }], params: zodJson(campaignParamsSchema), body: zodJson(recordMetricBodySchema), response: { 201: zodJson(R.recordMetricResponse) } },
    },
    async (request, reply) => {
      if (!request.user) throw new UnauthenticatedError("No session");
      const params = campaignParamsSchema.parse(request.params);
      const body = recordMetricBodySchema.parse(request.body);
      const result = await deps.recordMetric.execute({
        campaignId: params.campaignId,
        type: body.type,
        label: body.label,
        value: body.value,
        unit: body.unit,
        recordedBy: request.user.userId,
      });
      return reply.status(201).send(result);
    },
  );

  // ── Auth + campaigns:read: admin list ALL campaigns (inc. drafts) ────
  fastify.get(
    "/api/v1/admin/campaigns",
    {
      preHandler: [fastify.authenticate, requirePermissions("campaigns:read")],
      schema: { tags: ["Admin"], description: "List all campaigns (including drafts)", security: [{ bearerAuth: [] }], querystring: zodJson(adminListCampaignsQuerySchema), response: { 200: zodJson(R.campaignListResponse) } },
    },
    async (request) => {
      const query = adminListCampaignsQuerySchema.parse(request.query);
      const result = await deps.campaigns.findAll(
        { page: query.page, limit: query.limit },
        { tag: query.tag, status: query.status, sort: query.sort },
      );
      return {
        data: result.data.map((c) => ({
          id: c.id.value,
          title: c.title,
          slug: c.slug.value,
          description: c.description,
          coverImageUrl: c.coverImageUrl,
          fundingGoalCents: c.fundingGoal.target.amountCents,
          amountRaisedCents: c.amountRaised.amountCents,
          currency: c.fundingGoal.target.currency,
          donationCount: c.donationCount,
          progressPercentage: c.progressPercentage,
          status: c.status,
          tags: c.tags,
          startDate: c.startDate.toISOString(),
          endDate: c.endDate?.toISOString() ?? null,
        })),
        meta: result.meta,
      };
    },
  );

  // ── Public: get single campaign by slug ─────────
  fastify.get(
    "/api/v1/campaigns/:slug",
    { schema: { tags: ["Campaigns"], description: "Get a campaign by slug (public)", params: zodJson(campaignSlugParamsSchema), response: { 200: zodJson(R.campaignDetailResponse) } } },
    async (request) => {
      const { slug } = campaignSlugParamsSchema.parse(request.params);
      const campaign = await deps.campaigns.findBySlug(Slug.create(slug));
      if (!campaign) throw new NotFoundError("Campaign", slug);
      return {
        id: campaign.id.value,
        title: campaign.title,
        slug: campaign.slug.value,
        description: campaign.description,
        coverImageUrl: campaign.coverImageUrl,
        fundingGoalCents: campaign.fundingGoal.target.amountCents,
        amountRaisedCents: campaign.amountRaised.amountCents,
        currency: campaign.fundingGoal.target.currency,
        isFlexibleGoal: campaign.fundingGoal.isFlexible,
        donationCount: campaign.donationCount,
        progressPercentage: campaign.progressPercentage,
        status: campaign.status,
        tags: campaign.tags,
        isPublished: campaign.isPublished,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate?.toISOString() ?? null,
        publishedAt: campaign.publishedAt?.toISOString() ?? null,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      };
    },
  );

  // ── Auth + campaigns:write: delete a campaign ───
  fastify.delete(
    "/api/v1/campaigns/:campaignId",
    {
      preHandler: [fastify.authenticate, requirePermissions("campaigns:write")],
      schema: { tags: ["Campaigns"], description: "Delete a campaign", security: [{ bearerAuth: [] }], params: zodJson(campaignParamsSchema), response: { 204: { type: "null", description: "No content" } } },
    },
    async (request, reply) => {
      const { campaignId } = campaignParamsSchema.parse(request.params);
      const campaign = await deps.campaigns.findById(UniqueId.fromString(campaignId));
      if (!campaign) throw new NotFoundError("Campaign", campaignId);
      await deps.campaigns.delete(UniqueId.fromString(campaignId));
      return reply.status(204).send();
    },
  );

  // ── Public: aggregate impact metrics (cached) ────
  fastify.get("/api/v1/metrics/aggregate", { schema: { tags: ["Campaigns"], description: "Get aggregated impact metrics", response: { 200: zodJson(R.aggregateMetricsResponse) } } }, async (request, reply) => {
    const query = aggregateMetricsQuerySchema.parse(request.query);
    const result = await deps.getAggregateMetrics.execute({
      campaignIds: query.campaignIds,
      types: query.types,
    });
    reply.header("Cache-Control", "public, max-age=300");
    return reply.send(
      toMetricAggregateResponseDto(result.global, result.byCampaign),
    );
  });
}
