export const METRIC_TYPES = [
  "PEOPLE_SERVED",
  "ITEMS_DISTRIBUTED",
  "AREA_RESTORED",
  "FUNDS_DISBURSED",
  "CUSTOM",
] as const;

export type MetricType = (typeof METRIC_TYPES)[number];

export function isMetricType(value: string): value is MetricType {
  return METRIC_TYPES.includes(value as MetricType);
}
