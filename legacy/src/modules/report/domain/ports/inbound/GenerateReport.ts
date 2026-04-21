export interface GenerateReportInput {
  type: string;
  format: string;
  dateFrom?: string;
  dateTo?: string;
  campaignIds?: string[];
  generatedBy: string;
}

export interface GenerateReportOutput {
  reportId: string;
  status: string;
  estimatedSeconds: number;
}

export interface GenerateReport {
  execute(input: GenerateReportInput): Promise<GenerateReportOutput>;
}
