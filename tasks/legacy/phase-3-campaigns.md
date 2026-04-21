# Phase 3 — Content & Campaign Management

## Campaign Module — Domain
- [x] `entities/Campaign.ts` (aggregate — publish/pause/close/recordDonation)
- [x] `entities/ImpactMetric.ts`
- [x] `entities/CampaignUpdate.ts`
- [x] `value-objects/FundingGoal.ts`
- [x] `value-objects/CampaignStatus.ts`
- [x] `value-objects/MetricType.ts`
- [x] `events/CampaignCreated.ts`
- [x] `events/CampaignPublished.ts`
- [x] `events/CampaignGoalReached.ts`
- [x] `events/MetricRecorded.ts`
- [x] `ports/inbound/CreateCampaign.ts`
- [x] `ports/inbound/UpdateCampaign.ts`
- [x] `ports/inbound/RecordMetric.ts`
- [x] `ports/inbound/GetAggregateMetrics.ts`
- [x] `ports/inbound/ListPublicCampaigns.ts`
- [x] `ports/outbound/CampaignRepository.ts`
- [x] `ports/outbound/MetricRepository.ts`
- [x] `ports/outbound/MediaStorage.ts`

## Campaign Module — Application
- [x] `use-cases/CreateCampaignUseCase.ts`
- [x] `use-cases/UpdateCampaignUseCase.ts`
- [x] `use-cases/PublishCampaignUseCase.ts`
- [x] `use-cases/RecordMetricUseCase.ts`
- [x] `use-cases/GetAggregateMetricsUseCase.ts` (Redis cache, 5-min TTL)
- [x] `use-cases/ListPublicCampaignsUseCase.ts` (Redis cache, 2-min TTL)
- [x] `dtos/CampaignResponseDto.ts`
- [x] `dtos/MetricAggregateDto.ts`

## Campaign Module — Infrastructure
- [x] `adapters/http/campaign.routes.ts` (create, list, update, publish, recordMetric, aggregateMetrics)
- [x] `adapters/http/campaign.schema.ts` (Zod)
- [x] `adapters/persistence/PgCampaignRepository.ts` (slug lookup, public filter/sort, creator query)
- [x] `adapters/persistence/PgMetricRepository.ts` (aggregate by campaign, global summary)
- [x] `adapters/persistence/campaign.mapper.ts`
- [x] `adapters/external/S3MediaStorage.ts` (stub — Phase 4 implementation with @aws-sdk/client-s3)
- [x] `adapters/external/NoopMediaStorage.ts` (dev/test fallback)
- [x] `campaign.module.ts`
- [x] SQL migration `0005_campaigns.sql`: `campaigns`, `impact_metrics`, `campaign_updates` + FK donations→campaigns

## Cross-cutting
- [x] Subscribe campaign context to `DonationCompleted` → recordDonation (added campaignId to DonationCompleted event)
- [x] Cache invalidation on `MetricRecorded` / `CampaignPublished`

## Composition
- [x] Wire `campaign.module` into `src/main.ts` (with RedisCacheAdapter)

## Tests
- [x] Unit: Campaign aggregate (20 tests — create, tags, validation, publish/pause/close/archive, recordDonation, GoalReached, progressPercentage, updateDetails, rehydrate)
- [ ] Integration: PgCampaignRepository + slug lookup (deferred — needs Docker/testcontainers)
- [ ] Integration: Redis cache TTL + invalidation (deferred — needs running Redis)
- [ ] E2E: public GET /campaigns cached response (deferred — needs running server)
