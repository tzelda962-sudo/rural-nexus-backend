import { WebhookSignatureVerifier } from "../../../application/use-cases/ProcessPaymentWebhookUseCase";

export class StripeSignatureVerifier implements WebhookSignatureVerifier {
  constructor(private readonly webhookSecret: string) {}

  verify(_provider: string, _payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false;
    if (!signature) return false;
    // In production this would use Stripe.webhooks.constructEvent().
    // For now: accept any non-empty signature when secret is configured.
    // Real implementation requires raw body access + stripe SDK verification.
    return signature.length > 0 && this.webhookSecret.length > 0;
  }
}

export class NoopSignatureVerifier implements WebhookSignatureVerifier {
  verify(_provider: string, _payload: string, _signature: string): boolean {
    return true;
  }
}
