import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { Logger } from "pino";
import { EventBus } from "../../shared/domain/events/EventBus";
import { Money } from "../../shared/domain/value-objects/Money";
import { UniqueId } from "../../shared/domain/value-objects/UniqueId";
import { CachePort } from "../../shared/infrastructure/cache/CachePort";
import { CreateCampaignUseCase } from "./application/use-cases/CreateCampaignUseCase";
import { GetAggregateMetricsUseCase } from "./application/use-cases/GetAggregateMetricsUseCase";
import { ListPublicCampaignsUseCase } from "./application/use-cases/ListPublicCampaignsUseCase";
import { PublishCampaignUseCase } from "./application/use-cases/PublishCampaignUseCase";
import { RecordMetricUseCase } from "./application/use-cases/RecordMetricUseCase";
import { UpdateCampaignUseCase } from "./application/use-cases/UpdateCampaignUseCase";
import { CampaignRepository } from "./domain/ports/outbound/CampaignRepository";
import { registerCampaignRoutes } from "./infrastructure/adapters/http/campaign.routes";
import { PgCampaignRepository } from "./infrastructure/adapters/persistence/PgCampaignRepository";
import { PgMetricRepository } from "./infrastructure/adapters/persistence/PgMetricRepository";
import { MediaStorage } from "./domain/ports/outbound/MediaStorage";

export interface CampaignModuleDeps {
  pool: Pool;
  eventBus: EventBus;
  cache: CachePort;
  logger: Logger;
  mediaStorage?: MediaStorage;
}

export interface CampaignModule {
  registerRoutes: (fastify: FastifyInstance) => Promise<void>;
  campaigns: CampaignRepository;
}

export function createCampaignModule(
  deps: CampaignModuleDeps,
): CampaignModule {
  const { pool, eventBus, cache, logger } = deps;

  const campaigns = new PgCampaignRepository(pool);
  const metrics = new PgMetricRepository(pool);
  const createCampaign = new CreateCampaignUseCase(campaigns, eventBus);
  const updateCampaign = new UpdateCampaignUseCase(campaigns);
  const publishCampaign = new PublishCampaignUseCase(campaigns, eventBus);
  const recordMetric = new RecordMetricUseCase(campaigns, metrics, eventBus);
  const getAggregateMetrics = new GetAggregateMetricsUseCase(metrics, cache);
  const listPublicCampaigns = new ListPublicCampaignsUseCase(campaigns, cache);

  // Cross-cutting: listen for DonationCompleted → recordDonation on campaign
  eventBus.subscribe("donation.DonationCompleted", async (event) => {
    const campaignId = event.payload.campaignId as string | null;
    if (!campaignId) return;

    try {
      const campaign = await campaigns.findById(
        UniqueId.fromString(campaignId),
      );
      if (!campaign || campaign.status !== "ACTIVE") return;

      const amountCents = event.payload.amountCents as number;
      const currency = event.payload.currency as string;
      campaign.recordDonation(Money.fromCents(amountCents, currency));
      await campaigns.save(campaign);
      await eventBus.publishAll(campaign.pullEvents());
    } catch (err) {
      logger.error(
        { err, campaignId, eventId: event.eventId },
        "failed to record donation on campaign",
      );
    }
  });

  // Cache invalidation: clear public campaign list cache when a campaign is published
  eventBus.subscribe("campaign.CampaignPublished", async () => {
    await cache.delByPattern("campaigns:public:*");
  });

  // Cache invalidation: clear metrics aggregate cache when a new metric is recorded
  eventBus.subscribe("campaign.MetricRecorded", async () => {
    await cache.delByPattern("metrics:aggregate:*");
  });

  return {
    campaigns,
    async registerRoutes(fastify) {
      await registerCampaignRoutes(fastify, {
        createCampaign,
        updateCampaign,
        publishCampaign,
        recordMetric,
        getAggregateMetrics,
        listPublicCampaigns,
        campaigns,
      });
    },
  };
}
