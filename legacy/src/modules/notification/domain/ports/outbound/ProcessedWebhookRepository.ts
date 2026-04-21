export interface ProcessedWebhookResult {
  processed: boolean;
  action: string;
}

export interface ProcessedWebhookRepository {
  findByKey(idempotencyKey: string): Promise<ProcessedWebhookResult | null>;
  save(params: {
    idempotencyKey: string;
    provider: string;
    eventType: string;
    result: ProcessedWebhookResult;
  }): Promise<void>;
}
