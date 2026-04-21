import { ValidationError } from "../errors/ValidationError";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class Slug {
  private constructor(readonly value: string) {}

  static create(raw: string): Slug {
    if (!SLUG_REGEX.test(raw)) {
      throw new ValidationError(`Invalid slug: ${raw}`);
    }
    if (raw.length > 220) {
      throw new ValidationError("Slug cannot exceed 220 characters");
    }
    return new Slug(raw);
  }

  static fromTitle(title: string): Slug {
    const base = title
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (base.length === 0) {
      throw new ValidationError(`Cannot slugify title: "${title}"`);
    }
    const truncated = base.slice(0, 220);
    return new Slug(truncated);
  }

  equals(other?: Slug): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
