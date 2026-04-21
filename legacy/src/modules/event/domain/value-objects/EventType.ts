export type EventType =
  | "FUNDRAISER"
  | "VOLUNTEER_DRIVE"
  | "AWARENESS"
  | "COMMUNITY";

export const EVENT_TYPES: readonly EventType[] = [
  "FUNDRAISER",
  "VOLUNTEER_DRIVE",
  "AWARENESS",
  "COMMUNITY",
] as const;
