import { randomUUID } from "node:crypto";
import { ValidationError } from "../errors/ValidationError";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UniqueId {
  private constructor(readonly value: string) {}

  static generate(): UniqueId {
    return new UniqueId(randomUUID());
  }

  static fromString(raw: string): UniqueId {
    if (!UUID_V4.test(raw)) {
      throw new ValidationError(`Invalid UUID: ${raw}`);
    }
    return new UniqueId(raw.toLowerCase());
  }

  equals(other?: UniqueId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
