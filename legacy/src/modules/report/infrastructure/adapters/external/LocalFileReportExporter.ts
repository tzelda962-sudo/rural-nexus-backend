import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { ReportExporter } from "../../../domain/ports/outbound/ReportExporter";
import { ReportFormat } from "../../../domain/value-objects/ReportFormat";
import { ReportType } from "../../../domain/value-objects/ReportType";
import { generatePdfReport, PdfTableRow } from "./PdfGenerator";
import { generateCsvReport } from "./CsvGenerator";
import { generateXlsxReport } from "./XlsxGenerator";

const REPORT_QUERIES: Record<
  ReportType,
  { title: string; sql: string; headers: string[] }
> = {
  FINANCIAL_SUMMARY: {
    title: "Financial Summary",
    sql: `SELECT
        to_char(created_at, 'YYYY-MM') AS month,
        currency,
        COUNT(*) AS total_donations,
        SUM(amount_cents) AS total_cents
      FROM donations
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY month, currency
      ORDER BY month DESC`,
    headers: ["month", "currency", "total_donations", "total_cents"],
  },
  DONATION_DETAIL: {
    title: "Donation Detail",
    sql: `SELECT
        id, donor_email, amount_cents, currency, status,
        to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
      FROM donations
      WHERE created_at BETWEEN $1 AND $2
      ORDER BY created_at DESC`,
    headers: ["id", "donor_email", "amount_cents", "currency", "status", "created_at"],
  },
  IMPACT_SUMMARY: {
    title: "Impact Summary",
    sql: `SELECT
        type, label, SUM(value) AS total_value, unit
      FROM impact_metrics
      WHERE recorded_at BETWEEN $1 AND $2
      GROUP BY type, label, unit
      ORDER BY type, total_value DESC`,
    headers: ["type", "label", "total_value", "unit"],
  },
  VOLUNTEER_HOURS: {
    title: "Volunteer Hours",
    sql: `SELECT
        v.first_name, v.last_name, v.email,
        v.total_hours_logged,
        COUNT(va.id) AS assignments
      FROM volunteers v
      LEFT JOIN volunteer_assignments va ON va.volunteer_id = v.id
      GROUP BY v.id, v.first_name, v.last_name, v.email, v.total_hours_logged
      ORDER BY v.total_hours_logged DESC`,
    headers: ["first_name", "last_name", "email", "total_hours_logged", "assignments"],
  },
  DONOR_RETENTION: {
    title: "Donor Retention",
    sql: `SELECT
        dp.tier,
        COUNT(*) AS donor_count,
        AVG(dp.donation_count) AS avg_donations,
        AVG(dp.total_donated_all_time_cents) AS avg_total_cents
      FROM donor_profiles dp
      GROUP BY dp.tier
      ORDER BY avg_total_cents DESC`,
    headers: ["tier", "donor_count", "avg_donations", "avg_total_cents"],
  },
  TAX_REPORT: {
    title: "Tax Report",
    sql: `SELECT
        d.donor_email,
        SUM(d.amount_cents) AS total_cents,
        d.currency,
        COUNT(*) AS donation_count
      FROM donations d
      WHERE d.status = 'COMPLETED' AND d.created_at BETWEEN $1 AND $2
      GROUP BY d.donor_email, d.currency
      ORDER BY total_cents DESC`,
    headers: ["donor_email", "total_cents", "currency", "donation_count"],
  },
};

export class LocalFileReportExporter implements ReportExporter {
  constructor(
    private readonly pool: Pool,
    private readonly outputDir: string,
  ) {}

  async export(params: {
    type: ReportType;
    format: ReportFormat;
    parameters: Record<string, unknown>;
  }): Promise<{ fileUrl: string }> {
    const config = REPORT_QUERIES[params.type];
    const dateFrom = (params.parameters.dateFrom as string) || "2000-01-01";
    const dateTo = (params.parameters.dateTo as string) || "2099-12-31";

    const needsDates = config.sql.includes("$1");
    const queryParams = needsDates ? [dateFrom, dateTo] : [];
    const { rows } = await this.pool.query(config.sql, queryParams);

    const data = rows as PdfTableRow[];

    let buffer: Buffer;
    let ext: string;

    switch (params.format) {
      case "PDF":
        buffer = await generatePdfReport({
          title: config.title,
          headers: config.headers,
          rows: data,
        });
        ext = "pdf";
        break;
      case "CSV":
        buffer = generateCsvReport({
          headers: config.headers,
          rows: data,
        });
        ext = "csv";
        break;
      case "XLSX":
        buffer = await generateXlsxReport({
          title: config.title,
          headers: config.headers,
          rows: data,
        });
        ext = "xlsx";
        break;
    }

    await mkdir(this.outputDir, { recursive: true });
    const filename = `${params.type.toLowerCase()}-${randomUUID().slice(0, 8)}.${ext}`;
    const filepath = join(this.outputDir, filename);
    await writeFile(filepath, buffer);

    return { fileUrl: `file://${filepath}` };
  }
}
