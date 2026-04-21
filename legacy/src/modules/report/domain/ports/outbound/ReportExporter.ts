import { ReportFormat } from "../../value-objects/ReportFormat";
import { ReportType } from "../../value-objects/ReportType";

export interface ReportExporter {
  export(params: {
    type: ReportType;
    format: ReportFormat;
    parameters: Record<string, unknown>;
  }): Promise<{ fileUrl: string }>;
}
