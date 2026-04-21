import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { Email } from "../../../../shared/domain/value-objects/Email";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import { Notification } from "../../domain/entities/Notification";
import {
  SendNotification,
  SendNotificationInput,
  SendNotificationOutput,
} from "../../domain/ports/inbound/SendNotification";
import { EmailSender } from "../../domain/ports/outbound/EmailSender";
import { NotificationRepository } from "../../domain/ports/outbound/NotificationRepository";
import {
  isNotificationChannel,
  NotificationChannel,
} from "../../domain/value-objects/NotificationChannel";
import { TemplateId } from "../../domain/value-objects/TemplateId";

export class SendNotificationUseCase implements SendNotification {
  constructor(
    private readonly notifications: NotificationRepository,
    private readonly emailSender: EmailSender,
  ) {}

  async execute(input: SendNotificationInput): Promise<SendNotificationOutput> {
    if (!isNotificationChannel(input.channel)) {
      throw new ValidationError(`Invalid channel: ${input.channel}`);
    }

    const notification = Notification.create({
      recipientId: input.recipientId
        ? UniqueId.fromString(input.recipientId)
        : undefined,
      recipientEmail: Email.create(input.recipientEmail),
      channel: input.channel as NotificationChannel,
      templateId: new TemplateId(input.templateId),
      subject: input.subject,
      body: input.body,
      variables: input.variables,
    });

    await this.notifications.save(notification);

    if (notification.channel === "EMAIL") {
      try {
        await this.emailSender.send({
          to: notification.recipientEmail.value,
          subject: notification.subject,
          htmlBody: notification.body,
        });
        notification.markSent();
      } catch (err) {
        const reason =
          err instanceof Error ? err.message : "Unknown email error";
        notification.markFailed(reason);
      }
      await this.notifications.save(notification);
    }

    return {
      notificationId: notification.id.value,
      status: notification.status,
    };
  }
}
