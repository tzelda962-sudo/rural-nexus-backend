import { SmsSender } from "../../../domain/ports/outbound/SmsSender";

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export class TwilioSmsSender implements SmsSender {
  private failureCount = 0;
  private circuitOpenUntil: Date | null = null;
  private readonly failureThreshold = 5;
  private readonly resetTimeMs = 60_000;

  constructor(private readonly config: TwilioConfig) {}

  async send(params: {
    to: string;
    body: string;
  }): Promise<{ messageId: string }> {
    if (this.isCircuitOpen()) {
      throw new Error("Circuit breaker open — SMS service unavailable");
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: params.to,
          From: this.config.fromNumber,
          Body: params.body,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(
          `Twilio returned ${response.status}: ${await response.text()}`,
        );
      }

      this.resetCircuit();
      const data = (await response.json()) as { sid: string };
      return { messageId: data.sid };
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
