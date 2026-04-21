export interface RecordMetricInput {
  campaignId: string;
  type: string;
  label: string;
  value: number;
  unit: string;
  recordedBy: string;
}

export interface RecordMetricOutput {
  metricId: string;
}

export interface RecordMetric {
  execute(input: RecordMetricInput): Promise<RecordMetricOutput>;
}
