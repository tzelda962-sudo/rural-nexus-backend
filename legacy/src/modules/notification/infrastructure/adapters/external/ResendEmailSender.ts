import { Resend } from "resend";
import { EmailSender } from "../../../domain/ports/outbound/EmailSender";

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export class ResendEmailSender implements EmailSender {
  private readonly client: Resend;
  private readonly from: string;
  private failureCount = 0;
  private circuitOpenUntil: Date | null = null;
  private readonly failureThreshold = 5;
  private readonly resetTimeMs = 60_000;

  constructor(config: ResendConfig) {
    this.client = new Resend(config.apiKey);
    this.from = `${config.fromName} <${config.fromEmail}>`;
  }

  async send(params: {
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
  }): Promise<{ messageId: string }> {
    if (this.isCircuitOpen()) {
      throw new Error("Circuit breaker open — email service unavailable");
    }

    try {
      const { data, error } = await this.client.emails.send({
        from: this.from,
        to: [params.to],
        subject: params.subject,
        html: params.htmlBody,
        text: params.textBody,
        replyTo: params.replyTo,
        attachments: params.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      });

      if (error) {
        throw new Error(`Resend error: ${error.message}`);
      }

      this.resetCircuit();
      return { messageId: data?.id ?? crypto.randomUUID() };
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  private isCircuitOpen(): boolean {
    if (!this.circuitOpenUntil) return false;
    if (new Date() >= this.circuitOpenUntil) {
      this.circuitOpenUntil = null;
      this.failureCount = 0;
      return false;
    }
    return true;
  }

  private recordFailure(): void {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.circuitOpenUntil = new Date(Date.now() + this.resetTimeMs);
    }
  }

  private resetCircuit(): void {
    this.failureCount = 0;
    this.circuitOpenUntil = null;
  }
}
