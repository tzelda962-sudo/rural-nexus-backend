export const NOTIFICATION_CHANNELS = ["EMAIL", "SMS", "IN_APP"] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export function isNotificationChannel(
  value: string,
): value is NotificationChannel {
  return NOTIFICATION_CHANNELS.includes(value as NotificationChannel);
}
