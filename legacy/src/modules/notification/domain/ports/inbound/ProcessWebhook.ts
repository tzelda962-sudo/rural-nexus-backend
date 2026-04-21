export interface ProcessWebhookInput {
  provider: "stripe" | "paypal";
  eventType: string;
  payload: Record<string, unknown>;
  signature: string;
  idempotencyKey: string;
  receivedAt: Date;
}

export interface ProcessWebhookOutput {
  processed: boolean;
  action: string;
}

export interface ProcessWebhook {
  execute(input: ProcessWebhookInput): Promise<ProcessWebhookOutput>;
}
