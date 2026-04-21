import { z } from "zod";

export const createEventBodySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  type: z.enum(["FUNDRAISER", "VOLUNTEER_DRIVE", "AWARENESS", "COMMUNITY"]),
  campaignId: z.string().uuid().optional(),
  location: z.object({
    venue: z.string().min(1).max(300),
    address: z.string().min(1).max(500),
    coordinates: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .optional()
      .nullable(),
    isVirtual: z.boolean(),
    virtualLink: z.string().url().optional().nullable(),
  }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  maxAttendees: z.number().int().min(1).optional().nullable(),
});

export const eventParamsSchema = z.object({
  eventId: z.string().uuid(),
});

export const eventSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const cancelEventBodySchema = z.object({
  reason: z.string().min(1).max(1000),
});

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z
    .enum(["FUNDRAISER", "VOLUNTEER_DRIVE", "AWARENESS", "COMMUNITY"])
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
});
