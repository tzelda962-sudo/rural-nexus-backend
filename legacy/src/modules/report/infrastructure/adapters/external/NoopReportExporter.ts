import { ReportExporter } from "../../../domain/ports/outbound/ReportExporter";
import { ReportFormat } from "../../../domain/value-objects/ReportFormat";
import { ReportType } from "../../../domain/value-objects/ReportType";

export class NoopReportExporter implements ReportExporter {
  async export(params: {
    type: ReportType;
    format: ReportFormat;
    parameters: Record<string, unknown>;
  }): Promise<{ fileUrl: string }> {
    const ext = params.format.toLowerCase();
    return {
      fileUrl: `https://placeholder.local/reports/${Date.now()}-${params.type}.${ext}`,
    };
  }
}
