export interface SendNotificationInput {
  recipientId?: string;
  recipientEmail: string;
  channel: string;
  templateId: string;
  subject: string;
  body: string;
  variables?: Record<string, string>;
}

export interface SendNotificationOutput {
  notificationId: string;
  status: string;
}

export interface SendNotification {
  execute(input: SendNotificationInput): Promise<SendNotificationOutput>;
}
