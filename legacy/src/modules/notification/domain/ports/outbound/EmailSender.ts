export interface EmailSender {
  send(params: {
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>;
    replyTo?: string;
  }): Promise<{ messageId: string }>;
}
