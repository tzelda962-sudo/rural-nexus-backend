import { z } from "zod";

const skillSchema = z.object({
  name: z.string().min(1).max(60),
  proficiency: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]),
});

const availabilitySchema = z.object({
  days: z
    .array(z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]))
    .min(1),
  hoursPerWeek: z.number().int().min(1).max(80),
  timezone: z.string().min(1).max(64),
  preferRemote: z.boolean(),
});

export const registerVolunteerBodySchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(8).max(20).optional(),
  skills: z.array(skillSchema).min(1).max(20),
  availability: availabilitySchema,
  notes: z.string().max(1000).optional(),
});

export const updateAvailabilityBodySchema = z.object({
  availability: availabilitySchema,
});

export const volunteerParamsSchema = z.object({
  volunteerId: z.string().uuid(),
});

export const assignVolunteerBodySchema = z.object({
  campaignId: z.string().uuid(),
  role: z.string().min(1).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  hoursCommitted: z.number().min(0),
});

export const assignmentParamsSchema = z.object({
  assignmentId: z.string().uuid(),
});

export const completeAssignmentBodySchema = z.object({
  hoursLogged: z.number().min(0),
});

export const searchVolunteersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["PENDING_REVIEW", "ACTIVE", "INACTIVE", "SUSPENDED"])
    .optional(),
  minHoursPerWeek: z.coerce.number().int().min(1).max(80).optional(),
  skills: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v === undefined ? undefined : Array.isArray(v) ? v : [v])),
});
