import { randomUUID } from "node:crypto";
import {
  CreatePaymentIntentInput,
  CreateSubscriptionInput,
  PaymentGateway,
  PaymentIntentResult,
  SubscriptionResult,
} from "../../../domain/ports/outbound/PaymentGateway";

/**
 * In-memory payment gateway used in dev when STRIPE_SECRET_KEY is unset, and
 * in tests. Idempotency-aware: identical idempotencyKey returns the same intent.
 *
 * Do NOT enable in production.
 */
export class NoopPaymentGateway implements PaymentGateway {
  private intentsByKey = new Map<string, PaymentIntentResult>();

  async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResult> {
    const cached = this.intentsByKey.get(input.idempotencyKey);
    if (cached) return cached;
    const result: PaymentIntentResult = {
      paymentIntentId: `pi_test_${randomUUID()}`,
      clientSecret: `cs_test_${randomUUID()}`,
    };
    this.intentsByKey.set(input.idempotencyKey, result);
    return result;
  }

  async confirmPayment(_paymentIntentId: string): Promise<{ status: string }> {
    return { status: "succeeded" };
  }

  async refundPayment(_paymentIntentId: string): Promise<void> {
    /* noop */
  }

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<SubscriptionResult> {
    const cached = this.intentsByKey.get(input.idempotencyKey);
    if (cached) {
      return {
        subscriptionId: `sub_test_${cached.paymentIntentId}`,
        clientSecret: cached.clientSecret,
      };
    }
    const intent: PaymentIntentResult = {
      paymentIntentId: `pi_test_${randomUUID()}`,
      clientSecret: `cs_test_${randomUUID()}`,
    };
    this.intentsByKey.set(input.idempotencyKey, intent);
    return {
      subscriptionId: `sub_test_${intent.paymentIntentId}`,
      clientSecret: intent.clientSecret,
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<void> {
    /* noop */
  }
}
