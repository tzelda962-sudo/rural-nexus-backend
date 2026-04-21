import Stripe from "stripe";
import {
  CreatePaymentIntentInput,
  CreateSubscriptionInput,
  PaymentGateway,
  PaymentIntentResult,
  SubscriptionResult,
} from "../../../domain/ports/outbound/PaymentGateway";

export interface StripePaymentGatewayConfig {
  apiKey: string;
  apiVersion?: Stripe.LatestApiVersion;
}

export class StripePaymentGateway implements PaymentGateway {
  private readonly client: Stripe;

  constructor(config: StripePaymentGatewayConfig) {
    this.client = new Stripe(config.apiKey, {
      apiVersion: config.apiVersion,
      typescript: true,
    });
  }

  async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResult> {
    const intent = await this.client.paymentIntents.create(
      {
        amount: input.amountCents,
        currency: input.currency.toLowerCase(),
        receipt_email: input.donorEmail,
        metadata: input.metadata,
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: input.idempotencyKey },
    );
    if (!intent.client_secret) {
      throw new Error("Stripe returned a payment intent without a client secret");
    }
    return {
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<{ status: string }> {
    const intent = await this.client.paymentIntents.retrieve(paymentIntentId);
    return { status: intent.status };
  }

  async refundPayment(
    paymentIntentId: string,
    amountCents?: number,
  ): Promise<void> {
    await this.client.refunds.create({
      payment_intent: paymentIntentId,
      ...(amountCents !== undefined ? { amount: amountCents } : {}),
    });
  }

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<SubscriptionResult> {
    const customer = await this.client.customers.create({
      email: input.customerEmail,
      metadata: input.metadata,
    });

    const intervalMap = { month: "month", quarter: "month", year: "year" } as const;
    const intervalCount = input.interval === "quarter" ? 3 : 1;

    const price = await this.client.prices.create({
      currency: input.currency.toLowerCase(),
      unit_amount: input.amountCents,
      recurring: {
        interval: intervalMap[input.interval],
        interval_count: intervalCount,
      },
      product_data: { name: `NGO recurring donation (${input.interval})` },
    });

    const subscription = await this.client.subscriptions.create(
      {
        customer: customer.id,
        items: [{ price: price.id }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      },
      { idempotencyKey: input.idempotencyKey },
    );

    const invoice = subscription.latest_invoice as Stripe.Invoice | null;
    const paymentIntent =
      invoice && (invoice as unknown as { payment_intent?: Stripe.PaymentIntent })
        .payment_intent;
    if (!paymentIntent || !paymentIntent.client_secret) {
      throw new Error("Stripe subscription is missing a client secret");
    }
    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.client.subscriptions.cancel(subscriptionId);
  }
}
