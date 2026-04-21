import { ValidationError } from "../errors/ValidationError";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    if (typeof raw !== "string") {
      throw new ValidationError("Email must be a string");
    }
    const normalized = raw.trim().toLowerCase();
    if (normalized.length === 0 || normalized.length > 255) {
      throw new ValidationError("Email length must be between 1 and 255");
    }
    if (!EMAIL_REGEX.test(normalized)) {
      throw new ValidationError(`Invalid email: ${raw}`);
    }
    return new Email(normalized);
  }

  equals(other?: Email): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
