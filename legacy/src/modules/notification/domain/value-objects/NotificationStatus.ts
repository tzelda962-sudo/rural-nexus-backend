export const NOTIFICATION_STATUSES = [
  "QUEUED",
  "SENT",
  "FAILED",
  "BOUNCED",
] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export function isNotificationStatus(
  value: string,
): value is NotificationStatus {
  return NOTIFICATION_STATUSES.includes(value as NotificationStatus);
}
