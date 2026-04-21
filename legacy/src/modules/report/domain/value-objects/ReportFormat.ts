export const REPORT_FORMATS = ["PDF", "CSV", "XLSX"] as const;

export type ReportFormat = (typeof REPORT_FORMATS)[number];

export function isReportFormat(value: string): value is ReportFormat {
  return REPORT_FORMATS.includes(value as ReportFormat);
}
