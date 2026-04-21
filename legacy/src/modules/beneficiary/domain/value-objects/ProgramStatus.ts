export const PROGRAM_STATUSES = ["ACTIVE", "COMPLETED", "PLANNED"] as const;

export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export function isProgramStatus(value: string): value is ProgramStatus {
  return PROGRAM_STATUSES.includes(value as ProgramStatus);
}
