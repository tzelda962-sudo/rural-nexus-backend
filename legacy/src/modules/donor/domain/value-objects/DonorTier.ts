export const DONOR_TIERS = ["BRONZE", "SILVER", "GOLD", "PATRON"] as const;

export type DonorTier = (typeof DONOR_TIERS)[number];

// Thresholds in cents
export const TIER_THRESHOLDS: Record<DonorTier, number> = {
  BRONZE: 0,
  SILVER: 50_000, // $500
  GOLD: 200_000, // $2,000
  PATRON: 1_000_000, // $10,000
};

export function tierForAmount(totalCents: number): DonorTier {
  if (totalCents >= TIER_THRESHOLDS.PATRON) return "PATRON";
  if (totalCents >= TIER_THRESHOLDS.GOLD) return "GOLD";
  if (totalCents >= TIER_THRESHOLDS.SILVER) return "SILVER";
  return "BRONZE";
}

export function isDonorTier(value: string): value is DonorTier {
  return DONOR_TIERS.includes(value as DonorTier);
}
