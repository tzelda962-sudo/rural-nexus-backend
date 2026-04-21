import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { Logger } from "pino";
import { EventBus } from "../../shared/domain/events/EventBus";
import { Email } from "../../shared/domain/value-objects/Email";
import { Env } from "../../shared/infrastructure/config/env";
import { createQueue, NOTIFICATION_QUEUE } from "../../shared/infrastructure/queue/queue-factory";
import { Notification } from "./domain/entities/Notification";
import { EmailSender } from "./domain/ports/outbound/EmailSender";
import { TemplateId } from "./domain/value-objects/TemplateId";
import { ProcessPaymentWebhookUseCase, WebhookSignatureVerifier } from "./application/use-cases/ProcessPaymentWebhookUseCase";
import { SendNotificationUseCase } from "./application/use-cases/SendNotificationUseCase";
import { DonationRepository } from "../donation/domain/ports/outbound/DonationRepository";
import { NoopEmailSender } from "./infrastructure/adapters/external/NoopEmailSender";
import { ResendEmailSender } from "./infrastructure/adapters/external/ResendEmailSender";
import { SendGridEmailSender } from "./infrastructure/adapters/external/SendGridEmailSender";
import {
  NoopSignatureVerifier,
  StripeSignatureVerifier,
} from "./infrastructure/adapters/external/StripeSignatureVerifier";
import { registerWebhookRoutes } from "./infrastructure/adapters/http/webhook.routes";
import { PgNotificationRepository } from "./infrastructure/adapters/persistence/PgNotificationRepository";
import { PgProcessedWebhookRepository } from "./infrastructure/adapters/persistence/PgProcessedWebhookRepository";
import { createNotificationWorker } from "./infrastructure/workers/notification.worker";
import { NotificationJobData } from "./infrastructure/workers/notification.worker";

export interface NotificationModuleDeps {
  env: Env;
  pool: Pool;
  eventBus: EventBus;
  logger: Logger;
  donations: DonationRepository;
  redisConnection?: ConnectionOptions;
}

export interface NotificationModule {
  registerRoutes: (fastify: FastifyInstance) => Promise<void>;
  sendNotification: SendNotificationUseCase;
  notificationQueue?: Queue<NotificationJobData>;
  shutdownWorker?: () => Promise<void>;
}

export function createNotificationModule(
  deps: NotificationModuleDeps,
): NotificationModule {
  const { env, pool, eventBus, logger, donations, redisConnection } = deps;

  const notifications = new PgNotificationRepository(pool);
  const processedWebhooks = new PgProcessedWebhookRepository(pool);

  let emailSender: EmailSender;
  if (env.RESEND_API_KEY) {
    emailSender = new ResendEmailSender({
      apiKey: env.RESEND_API_KEY,
      fromEmail: env.RESEND_FROM_EMAIL,
      fromName: env.RESEND_FROM_NAME,
    });
    logger.info("using Resend email provider");
  } else if (env.SENDGRID_API_KEY) {
    emailSender = new SendGridEmailSender({
      apiKey: env.SENDGRID_API_KEY,
      fromEmail: env.SENDGRID_FROM_EMAIL ?? "noreply@ngo-platform.org",
      fromName: env.SENDGRID_FROM_NAME ?? "NGO Platform",
    });
    logger.info("using SendGrid email provider");
  } else {
    logger.warn("no email provider configured — using NoopEmailSender");
    emailSender = new NoopEmailSender();
  }

  const signatureVerifier: WebhookSignatureVerifier =
    env.STRIPE_WEBHOOK_SECRET
      ? new StripeSignatureVerifier(env.STRIPE_WEBHOOK_SECRET)
      : (logger.warn(
          "STRIPE_WEBHOOK_SECRET not set — using NoopSignatureVerifier",
        ),
        new NoopSignatureVerifier());

  const sendNotification = new SendNotificationUseCase(
    notifications,
    emailSender,
  );
  const processWebhook = new ProcessPaymentWebhookUseCase(
    processedWebhooks,
    donations,
    eventBus,
    signatureVerifier,
  );

  let notificationQueue: Queue<NotificationJobData> | undefined;
  let shutdownWorker: (() => Promise<void>) | undefined;

  if (redisConnection) {
    notificationQueue = createQueue(NOTIFICATION_QUEUE, redisConnection);
    const worker = createNotificationWorker({
      connection: redisConnection,
      notifications,
      emailSender,
      logger,
    });

    worker.on("failed", (job, err) => {
      logger.error(
        { jobId: job?.id, err },
        "notification job failed",
      );
    });

    shutdownWorker = async () => {
      await worker.close();
      await notificationQueue!.close();
    };
  }

  const enqueueOrSendDirectly = async (jobData: NotificationJobData): Promise<void> => {
    if (notificationQueue) {
      await notificationQueue.add("send", jobData, {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      });
    } else {
      const notification = Notification.create({
        recipientEmail: Email.create(jobData.recipientEmail),
        channel: jobData.channel,
        templateId: new TemplateId(jobData.templateId),
        subject: jobData.subject,
        body: jobData.body,
        variables: jobData.variables,
      });
      await notifications.save(notification);
      try {
        await emailSender.send({
          to: jobData.recipientEmail,
          subject: jobData.subject,
          htmlBody: jobData.body,
        });
        notification.markSent();
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Unknown error";
        notification.markFailed(reason);
      }
      await notifications.save(notification);
    }
  };

  // Cross-module event handlers
  eventBus.subscribe("donation.DonationCompleted", async (event) => {
    try {
      const donorEmail = event.payload.donorEmail as string;
      const amountCents = event.payload.amountCents as number;
      const currency = event.payload.currency as string;

      await enqueueOrSendDirectly({
        recipientEmail: donorEmail,
        channel: "EMAIL",
        templateId: TemplateId.DONATION_RECEIPT.value,
        subject: "Thank you for your donation!",
        body: `<p>Thank you for your generous donation of ${(amountCents / 100).toFixed(2)} ${currency}.</p><p>Your receipt is attached.</p>`,
        variables: {
          amountCents: String(amountCents),
          currency,
          donationId: event.aggregateId,
        },
      });
    } catch (err) {
      logger.error(
        { err, eventId: event.eventId },
        "failed to enqueue donation receipt",
      );
    }
  });

  eventBus.subscribe("volunteer.VolunteerRegistered", async (event) => {
    try {
      const email = event.payload.email as string;
      const firstName = event.payload.firstName as string;

      await enqueueOrSendDirectly({
        recipientEmail: email,
        channel: "EMAIL",
        templateId: TemplateId.VOLUNTEER_WELCOME.value,
        subject: `Welcome aboard, ${firstName}!`,
        body: `<p>Hi ${firstName},</p><p>Thank you for volunteering! We'll review your application and get back to you shortly.</p>`,
        variables: { firstName },
      });
    } catch (err) {
      logger.error(
        { err, eventId: event.eventId },
        "failed to enqueue volunteer welcome email",
      );
    }
  });

  eventBus.subscribe("campaign.CampaignGoalReached", async (event) => {
    const title = event.payload.title as string;
    logger.info(
      { campaignId: event.aggregateId, title },
      "campaign goal reached — notification queued",
    );
  });

  return {
    sendNotification,
    notificationQueue,
    shutdownWorker,
    async registerRoutes(fastify) {
      await registerWebhookRoutes(fastify, { processWebhook });
    },
  };
}
