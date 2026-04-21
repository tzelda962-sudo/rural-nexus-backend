import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { Logger } from "pino";
import { EventBus } from "../../shared/domain/events/EventBus";
import { Env } from "../../shared/infrastructure/config/env";
import { ConfirmDonationUseCase } from "./application/use-cases/ConfirmDonationUseCase";
import { CreateDonationIntentUseCase } from "./application/use-cases/CreateDonationIntentUseCase";
import { GetDonationHistoryUseCase } from "./application/use-cases/GetDonationHistoryUseCase";
import { RefundDonationUseCase } from "./application/use-cases/RefundDonationUseCase";
import { DonationRepository } from "./domain/ports/outbound/DonationRepository";
import { PaymentGateway } from "./domain/ports/outbound/PaymentGateway";
import { NoopPaymentGateway } from "./infrastructure/adapters/external/NoopPaymentGateway";
import { StripePaymentGateway } from "./infrastructure/adapters/external/StripePaymentGateway";
import { registerDonationRoutes } from "./infrastructure/adapters/http/donation.routes";
import { PgDonationRepository } from "./infrastructure/adapters/persistence/PgDonationRepository";

export interface DonationModuleDeps {
  env: Env;
  pool: Pool;
  eventBus: EventBus;
  logger: Logger;
  /** Override the gateway (used by tests). */
  gateway?: PaymentGateway;
}

export interface DonationModule {
  registerRoutes: (fastify: FastifyInstance) => Promise<void>;
  donations: DonationRepository;
}

export function createDonationModule(deps: DonationModuleDeps): DonationModule {
  const { env, pool, eventBus, logger, gateway } = deps;

  const donations = new PgDonationRepository(pool);

  const paymentGateway: PaymentGateway =
    gateway ??
    (env.STRIPE_SECRET_KEY
      ? new StripePaymentGateway({ apiKey: env.STRIPE_SECRET_KEY })
      : (logger.warn(
          "STRIPE_SECRET_KEY not set — using NoopPaymentGateway. Do NOT enable in production.",
        ),
        new NoopPaymentGateway()));

  const createIntent = new CreateDonationIntentUseCase(
    donations,
    paymentGateway,
    eventBus,
  );
  const confirm = new ConfirmDonationUseCase(donations, paymentGateway, eventBus);
  const history = new GetDonationHistoryUseCase(donations);
  const refund = new RefundDonationUseCase(donations, paymentGateway, eventBus);

  return {
    donations,
    async registerRoutes(fastify) {
      await registerDonationRoutes(fastify, {
        createIntent,
        confirm,
        history,
        refund,
        donations,
      });
    },
  };
}
