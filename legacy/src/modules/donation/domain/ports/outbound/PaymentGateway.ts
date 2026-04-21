export interface CreatePaymentIntentInput {
  amountCents: number;
  currency: string;
  donorEmail: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
}

export interface CreateSubscriptionInput {
  customerEmail: string;
  amountCents: number;
  currency: string;
  interval: "month" | "quarter" | "year";
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionResult {
  subscriptionId: string;
  clientSecret: string;
}

export interface PaymentGateway {
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  confirmPayment(paymentIntentId: string): Promise<{ status: string }>;
  refundPayment(paymentIntentId: string, amountCents?: number): Promise<void>;
  createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}
