import { ValidationError } from "../errors/ValidationError";

const ISO_CURRENCY = /^[A-Z]{3}$/;

export class Money {
  private constructor(
    readonly amountCents: number,
    readonly currency: string,
  ) {}

  static fromCents(cents: number, currency: string): Money {
    if (!Number.isInteger(cents)) {
      throw new ValidationError("Amount must be an integer number of cents");
    }
    if (cents < 0) {
      throw new ValidationError("Amount cannot be negative");
    }
    const normalized = currency.toUpperCase();
    if (!ISO_CURRENCY.test(normalized)) {
      throw new ValidationError(`Invalid ISO 4217 currency: ${currency}`);
    }
    return new Money(cents, normalized);
  }

  static fromMajorUnits(major: number, currency: string): Money {
    return Money.fromCents(Math.round(major * 100), currency);
  }

  static zero(currency: string): Money {
    return Money.fromCents(0, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountCents + other.amountCents, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.amountCents - other.amountCents;
    if (result < 0) {
      throw new ValidationError("Resulting amount cannot be negative");
    }
    return new Money(result, this.currency);
  }

  isGreaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amountCents >= other.amountCents;
  }

  equals(other?: Money): boolean {
    if (!other) return false;
    return this.amountCents === other.amountCents && this.currency === other.currency;
  }

  toDisplayString(): string {
    return `${(this.amountCents / 100).toFixed(2)} ${this.currency}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new ValidationError(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }
}
