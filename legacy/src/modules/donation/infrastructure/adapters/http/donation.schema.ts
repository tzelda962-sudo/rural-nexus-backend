import { z } from "zod";
import {
  MAX_DONATION_CENTS,
  MIN_DONATION_CENTS,
} from "../../../domain/entities/Donation";

export const ALLOWED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "XAF",
] as const;

export const createDonationIntentBodySchema = z.object({
  donorEmail: z.string().email().max(255),
  amountCents: z
    .number()
    .int()
    .min(MIN_DONATION_CENTS)
    .max(MAX_DONATION_CENTS),
  currency: z.enum(ALLOWED_CURRENCIES),
  frequency: z.enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "YEARLY"]),
  campaignId: z.string().uuid().optional(),
  paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "MOBILE_MONEY", "PAYPAL"]),
  idempotencyKey: z.string().min(16).max(64),
  metadata: z.record(z.string()).optional(),
});

export const confirmDonationBodySchema = z.object({
  paymentIntentId: z.string().min(1).max(255),
});

export const donationParamsSchema = z.object({
  donationId: z.string().uuid(),
});

export const donationHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum([
      "INTENT_CREATED",
      "PROCESSING",
      "COMPLETED",
      "FAILED",
      "REFUNDED",
      "CANCELLED",
    ])
    .optional(),
  campaignId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
