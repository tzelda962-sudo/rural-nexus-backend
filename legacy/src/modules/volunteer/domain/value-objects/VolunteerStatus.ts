export type VolunteerStatus =
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export const VOLUNTEER_STATUSES: readonly VolunteerStatus[] = [
  "PENDING_REVIEW",
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
];

export function isVolunteerStatus(value: unknown): value is VolunteerStatus {
  return (
    typeof value === "string" &&
    (VOLUNTEER_STATUSES as readonly string[]).includes(value)
  );
}
