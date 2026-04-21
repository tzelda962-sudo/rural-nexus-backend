import { ValidationError } from "../errors/ValidationError";

export class DateRange {
  private constructor(readonly start: Date, readonly end: Date | null) {}

  static create(start: Date, end: Date | null): DateRange {
    if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
      throw new ValidationError("DateRange start must be a valid Date");
    }
    if (end !== null) {
      if (!(end instanceof Date) || Number.isNaN(end.getTime())) {
        throw new ValidationError("DateRange end must be a valid Date or null");
      }
      if (end.getTime() < start.getTime()) {
        throw new ValidationError("DateRange end must be on or after start");
      }
    }
    return new DateRange(start, end);
  }

  contains(date: Date): boolean {
    if (date.getTime() < this.start.getTime()) return false;
    if (this.end && date.getTime() > this.end.getTime()) return false;
    return true;
  }

  isExpired(now: Date = new Date()): boolean {
    return this.end !== null && now.getTime() > this.end.getTime();
  }
}
