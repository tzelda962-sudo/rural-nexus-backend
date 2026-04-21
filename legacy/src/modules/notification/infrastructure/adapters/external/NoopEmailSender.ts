import { randomUUID } from "node:crypto";
import { EmailSender } from "../../../domain/ports/outbound/EmailSender";

export class NoopEmailSender implements EmailSender {
  readonly sent: Array<{ to: string; subject: string }> = [];

  async send(params: {
    to: string;
    subject: string;
    htmlBody: string;
  }): Promise<{ messageId: string }> {
    this.sent.push({ to: params.to, subject: params.subject });
    return { messageId: `noop_${randomUUID()}` };
  }
}
