import { ValidationError } from "../../../../shared/domain/errors/ValidationError";

export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export const DAYS: readonly DayOfWeek[] = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
];

export class Availability {
  private constructor(
    readonly days: readonly DayOfWeek[],
    readonly hoursPerWeek: number,
    readonly timezone: string,
    readonly preferRemote: boolean,
  ) {}

  static create(params: {
    days: string[];
    hoursPerWeek: number;
    timezone: string;
    preferRemote: boolean;
  }): Availability {
    const allowed = new Set(DAYS);
    const days = Array.from(new Set(params.days)) as DayOfWeek[];
    for (const d of days) {
      if (!allowed.has(d)) {
        throw new ValidationError(`Invalid day of week: ${d}`);
      }
    }
    if (
      !Number.isInteger(params.hoursPerWeek) ||
      params.hoursPerWeek < 1 ||
      params.hoursPerWeek > 80
    ) {
      throw new ValidationError("hoursPerWeek must be an integer between 1 and 80");
    }
    if (typeof params.timezone !== "string" || params.timezone.length === 0) {
      throw new ValidationError("timezone is required");
    }
    return new Availability(
      days,
      params.hoursPerWeek,
      params.timezone,
      params.preferRemote,
    );
  }

  toJSON(): {
    days: DayOfWeek[];
    hoursPerWeek: number;
    timezone: string;
    preferRemote: boolean;
  } {
    return {
      days: [...this.days],
      hoursPerWeek: this.hoursPerWeek,
      timezone: this.timezone,
      preferRemote: this.preferRemote,
    };
  }
}
