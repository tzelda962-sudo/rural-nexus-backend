import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { Logger } from "pino";
import { EventBus } from "../../shared/domain/events/EventBus";
import { Money } from "../../shared/domain/value-objects/Money";
import { UniqueId } from "../../shared/domain/value-objects/UniqueId";
import { GetDonorProfileUseCase } from "./application/use-cases/GetDonorProfileUseCase";
import { UpdateCommunicationPreferencesUseCase } from "./application/use-cases/UpdateCommunicationPreferencesUseCase";
import { DonorProfile } from "./domain/entities/DonorProfile";
import { registerDonorRoutes } from "./infrastructure/adapters/http/donor.routes";
import { PgDonorRepository } from "./infrastructure/adapters/persistence/PgDonorRepository";

export interface DonorModuleDeps {
  pool: Pool;
  eventBus: EventBus;
  logger: Logger;
}

export interface DonorModule {
  registerRoutes: (fastify: FastifyInstance) => Promise<void>;
}

export function createDonorModule(deps: DonorModuleDeps): DonorModule {
  const { pool, eventBus, logger } = deps;

  const donors = new PgDonorRepository(pool);

  const getDonorProfile = new GetDonorProfileUseCase(donors);
  const updateCommPrefs = new UpdateCommunicationPreferencesUseCase(donors);

  // On DonationCompleted: upsert donor profile, record donation, recalculate tier
  eventBus.subscribe("donation.DonationCompleted", async (event) => {
    const donorEmail = event.payload.donorEmail as string;
    const amountCents = event.payload.amountCents as number;
    const currency = event.payload.currency as string;

    // donorId may be null for anonymous donations
    const donorIdRaw = event.payload.donorId as string | null | undefined;
    if (!donorIdRaw) return;

    try {
      const userId = UniqueId.fromString(donorIdRaw);
      let profile = await donors.findByUserId(userId);

      if (!profile) {
        profile = DonorProfile.create(userId, currency);
      }

      profile.recordDonation(Money.fromCents(amountCents, currency));
      await donors.save(profile);

      logger.info(
        {
          userId: donorIdRaw,
          tier: profile.tier,
          totalCents: profile.totalDonatedAllTime.amountCents,
        },
        "donor profile updated",
      );
    } catch (err) {
      logger.error(
        { err, donorEmail, eventId: event.eventId },
        "failed to update donor profile",
      );
    }
  });

  return {
    async registerRoutes(fastify) {
      await registerDonorRoutes(fastify, { getDonorProfile, updateCommPrefs });
    },
  };
}
