import { z } from "zod";

export const generateReportBodySchema = z.object({
  type: z.enum([
    "FINANCIAL_SUMMARY",
    "DONATION_DETAIL",
    "IMPACT_SUMMARY",
    "VOLUNTEER_HOURS",
    "DONOR_RETENTION",
    "TAX_REPORT",
  ]),
  format: z.enum(["PDF", "CSV", "XLSX"]),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  campaignIds: z.array(z.string().uuid()).optional(),
});

export const reportParamsSchema = z.object({
  reportId: z.string().uuid(),
});
