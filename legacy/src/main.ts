import "reflect-metadata";
import { loadEnv } from "./shared/infrastructure/config/env";
import { createPgPool } from "./shared/infrastructure/database/pg-pool";
import { createRedisClient } from "./shared/infrastructure/cache/redis-client";
import { createLogger } from "./shared/infrastructure/logging/pino-logger";
import { buildServer } from "./shared/infrastructure/http/server";
import { InMemoryEventBus } from "./shared/infrastructure/events/InMemoryEventBus";
import { RedisCacheAdapter } from "./shared/infrastructure/cache/RedisCacheAdapter";
import { createMediaStorage } from "./shared/infrastructure/storage/media-storage-factory";
import { createIamModule } from "./modules/iam/iam.module";
import { createDonationModule } from "./modules/donation/donation.module";
import { createVolunteerModule } from "./modules/volunteer/volunteer.module";
import { createCampaignModule } from "./modules/campaign/campaign.module";
import { createNotificationModule } from "./modules/notification/notification.module";
import { createReportModule } from "./modules/report/report.module";
import { createDonorModule } from "./modules/donor/donor.module";
import { createBeneficiaryModule } from "./modules/beneficiary/beneficiary.module";
import { createEventModule } from "./modules/event/event.module";

async function main(): Promise<void> {
  const env = loadEnv();
  const logger = createLogger(env);

  logger.info({ nodeEnv: env.NODE_ENV, port: env.PORT }, "starting ngo-api");

  const pgPool = createPgPool(env);
  const redis = createRedisClient(env);

  // Verify connectivity before binding the port
  try {
    await pgPool.query("SELECT 1");
    logger.info("postgres connection ok");
  } catch (err) {
    logger.error({ err }, "postgres connection failed");
    process.exit(1);
  }

  try {
    await redis.ping();
    logger.info("redis connection ok");
  } catch (err) {
    logger.error({ err }, "redis connection failed");
    process.exit(1);
  }

  const eventBus = new InMemoryEventBus(logger);
  const cache = new RedisCacheAdapter(redis);
  const mediaStorage = createMediaStorage(env);
  const iamModule = createIamModule({ env, pool: pgPool, redis, eventBus });
  const donationModule = createDonationModule({
    env,
    pool: pgPool,
    eventBus,
    logger,
  });
  const volunteerModule = createVolunteerModule({ pool: pgPool, eventBus });
  const campaignModule = createCampaignModule({
    pool: pgPool,
    eventBus,
    cache,
    logger,
    mediaStorage,
  });
  const notificationModule = createNotificationModule({
    env,
    pool: pgPool,
    eventBus,
    logger,
    donations: donationModule.donations,
    redisConnection: redis,
  });
  const reportModule = createReportModule({
    pool: pgPool,
    redisConnection: redis,
    logger,
  });
  const donorModule = createDonorModule({
    pool: pgPool,
    eventBus,
    logger,
  });
  const beneficiaryModule = createBeneficiaryModule({ pool: pgPool });
  const eventModule = createEventModule({
    pool: pgPool,
    eventBus,
    logger,
  });

  const fastify = await buildServer({
    env,
    logger,
    pgPool,
    redis,
    tokenVerifier: iamModule.tokenService,
  });

  await iamModule.registerRoutes(fastify);
  await donationModule.registerRoutes(fastify);
  await volunteerModule.registerRoutes(fastify);
  await campaignModule.registerRoutes(fastify);
  await notificationModule.registerRoutes(fastify);
  await reportModule.registerRoutes(fastify);
  await donorModule.registerRoutes(fastify);
  await beneficiaryModule.registerRoutes(fastify);
  await eventModule.registerRoutes(fastify);

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "shutdown requested, draining...");
    try {
      await notificationModule.shutdownWorker?.();
      await reportModule.shutdownWorker?.();
      await fastify.close();
      await pgPool.end();
      redis.disconnect();
      logger.info("shutdown complete");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "unhandledRejection");
  });
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "uncaughtException — exiting");
    process.exit(1);
  });

  try {
    await fastify.listen({ port: env.PORT, host: "0.0.0.0" });
    logger.info({ port: env.PORT }, "ngo-api listening");
  } catch (err) {
    logger.error({ err }, "failed to start server");
    process.exit(1);
  }
}

void main();
