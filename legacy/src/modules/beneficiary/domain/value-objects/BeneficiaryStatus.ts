export const BENEFICIARY_STATUSES = [
  "ACTIVE",
  "GRADUATED",
  "INACTIVE",
] as const;

export type BeneficiaryStatus = (typeof BENEFICIARY_STATUSES)[number];

export function isBeneficiaryStatus(
  value: string,
): value is BeneficiaryStatus {
  return BENEFICIARY_STATUSES.includes(value as BeneficiaryStatus);
}
