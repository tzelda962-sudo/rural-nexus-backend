import { EmailSender } from "../../../domain/ports/outbound/EmailSender";

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export class SendGridEmailSender implements EmailSender {
  private failureCount = 0;
  private circuitOpenUntil: Date | null = null;
  private readonly failureThreshold = 5;
  private readonly resetTimeMs = 60_000;

  constructor(private readonly config: SendGridConfig) {}

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
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: params.to }] }],
          from: { email: this.config.fromEmail, name: this.config.fromName },
          subject: params.subject,
          content: [
            ...(params.textBody
              ? [{ type: "text/plain", value: params.textBody }]
              : []),
            { type: "text/html", value: params.htmlBody },
          ],
          ...(params.replyTo
            ? { reply_to: { email: params.replyTo } }
            : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `SendGrid returned ${response.status}: ${await response.text()}`,
        );
      }

      this.resetCircuit();
      const messageId =
        response.headers.get("x-message-id") ?? crypto.randomUUID();
      return { messageId };
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
