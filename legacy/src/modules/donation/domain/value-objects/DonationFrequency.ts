export type DonationFrequency = "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export const DONATION_FREQUENCIES: readonly DonationFrequency[] = [
  "ONE_TIME",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
];

export function isRecurringFrequency(f: DonationFrequency): boolean {
  return f !== "ONE_TIME";
}
