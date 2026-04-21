export type DonationStatus =
  | "INTENT_CREATED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export const DONATION_STATUSES: readonly DonationStatus[] = [
  "INTENT_CREATED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
];

export function isDonationStatus(value: unknown): value is DonationStatus {
  return (
    typeof value === "string" &&
    (DONATION_STATUSES as readonly string[]).includes(value)
  );
}
