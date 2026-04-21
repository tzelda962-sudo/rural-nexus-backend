import { ValidationError } from "../errors/ValidationError";

// E.164-ish: +<country><subscriber>, 8–15 digits
const E164 = /^\+[1-9]\d{7,14}$/;

export class PhoneNumber {
  private constructor(readonly value: string) {}

  static create(raw: string): PhoneNumber {
    const normalized = raw.replace(/[\s\-()]/g, "");
    if (!E164.test(normalized)) {
      throw new ValidationError(
        `Invalid phone number: expected E.164 format, got "${raw}"`,
      );
    }
    return new PhoneNumber(normalized);
  }

  equals(other?: PhoneNumber): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
