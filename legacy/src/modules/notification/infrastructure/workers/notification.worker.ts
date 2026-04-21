import { Job, Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { Logger } from "pino";
import { Email } from "../../../../shared/domain/value-objects/Email";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { createWorker, NOTIFICATION_QUEUE } from "../../../../shared/infrastructure/queue/queue-factory";
import { Notification } from "../../domain/entities/Notification";
import { EmailSender } from "../../domain/ports/outbound/EmailSender";
import { NotificationRepository } from "../../domain/ports/outbound/NotificationRepository";
import { NotificationChannel } from "../../domain/value-objects/NotificationChannel";
import { TemplateId } from "../../domain/value-objects/TemplateId";

export interface NotificationJobData {
  recipientId?: string;
  recipientEmail: string;
  channel: NotificationChannel;
  templateId: string;
  subject: string;
  body: string;
  variables?: Record<string, string>;
}

export function createNotificationWorker(deps: {
  connection: ConnectionOptions;
  notifications: NotificationRepository;
  emailSender: EmailSender;
  logger: Logger;
}): Worker<NotificationJobData> {
  const { connection, notifications, emailSender, logger } = deps;

  return createWorker<NotificationJobData>(
    NOTIFICATION_QUEUE,
    async (job: Job<NotificationJobData>) => {
      const data = job.data;

      const notification = Notification.create({
        recipientId: data.recipientId
          ? UniqueId.fromString(data.recipientId)
          : undefined,
        recipientEmail: Email.create(data.recipientEmail),
        channel: data.channel,
        templateId: new TemplateId(data.templateId),
        subject: data.subject,
        body: data.body,
        variables: data.variables,
      });

      await notifications.save(notification);

      if (data.channel === "EMAIL") {
        await emailSender.send({
          to: data.recipientEmail,
          subject: data.subject,
          htmlBody: data.body,
        });
        notification.markSent();
      } else {
        notification.markSent();
      }

      await notifications.save(notification);

      logger.info(
        { notificationId: notification.id.value, channel: data.channel },
        "notification processed",
      );
    },
    connection,
    3,
  );
}
