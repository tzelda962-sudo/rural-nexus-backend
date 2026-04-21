import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(12).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export const loginBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const assignRoleParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const assignRoleBodySchema = z.object({
  roleName: z.enum(["ADMIN", "STAFF", "VOLUNTEER", "DONOR"]),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  userId: z.string().uuid().optional(),
  action: z.string().max(100).optional(),
  resource: z.string().max(255).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
