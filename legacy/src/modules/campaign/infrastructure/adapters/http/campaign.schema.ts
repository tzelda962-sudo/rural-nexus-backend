import { z } from "zod";

export const ALLOWED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "XAF",
] as const;

export const createCampaignBodySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  fundingGoalCents: z.number().int().min(1000),
  currency: z.enum(ALLOWED_CURRENCIES),
  isFlexibleGoal: z.boolean().default(false),
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
});

export const updateCampaignBodySchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).optional(),
  endDate: z.string().date().optional(),
});

export const campaignParamsSchema = z.object({
  campaignId: z.string().uuid(),
});

export const listCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  tag: z.string().optional(),
  status: z.enum(["ACTIVE", "CLOSED"]).optional(),
  sort: z.enum(["newest", "most_funded", "ending_soon"]).optional(),
});

export const adminListCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  tag: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED", "ARCHIVED"]).optional(),
  sort: z.enum(["newest", "most_funded", "ending_soon"]).optional(),
});

export const campaignSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const recordMetricBodySchema = z.object({
  type: z.enum([
    "PEOPLE_SERVED",
    "ITEMS_DISTRIBUTED",
    "AREA_RESTORED",
    "FUNDS_DISBURSED",
    "CUSTOM",
  ]),
  label: z.string().min(1).max(200),
  value: z.number().min(0),
  unit: z.string().min(1).max(50),
});

export const aggregateMetricsQuerySchema = z.object({
  campaignIds: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional(),
  types: z
    .union([
      z.enum([
        "PEOPLE_SERVED",
        "ITEMS_DISTRIBUTED",
        "AREA_RESTORED",
        "FUNDS_DISBURSED",
        "CUSTOM",
      ]),
      z.array(
        z.enum([
          "PEOPLE_SERVED",
          "ITEMS_DISTRIBUTED",
          "AREA_RESTORED",
          "FUNDS_DISBURSED",
          "CUSTOM",
        ]),
      ),
    ])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional(),
});
