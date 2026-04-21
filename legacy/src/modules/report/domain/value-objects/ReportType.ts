export const REPORT_TYPES = [
  "FINANCIAL_SUMMARY",
  "DONATION_DETAIL",
  "IMPACT_SUMMARY",
  "VOLUNTEER_HOURS",
  "DONOR_RETENTION",
  "TAX_REPORT",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export function isReportType(value: string): value is ReportType {
  return REPORT_TYPES.includes(value as ReportType);
}
