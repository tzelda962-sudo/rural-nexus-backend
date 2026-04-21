import { randomUUID } from "node:crypto";
import { SmsSender } from "../../../domain/ports/outbound/SmsSender";

export class NoopSmsSender implements SmsSender {
  readonly sent: Array<{ to: string; body: string }> = [];

  async send(params: {
    to: string;
    body: string;
  }): Promise<{ messageId: string }> {
    this.sent.push({ to: params.to, body: params.body });
    return { messageId: `noop_sms_${randomUUID()}` };
  }
}
