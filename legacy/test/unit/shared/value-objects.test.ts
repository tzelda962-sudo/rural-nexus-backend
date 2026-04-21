import { describe, expect, it } from "vitest";
import { Email } from "../../../src/shared/domain/value-objects/Email";
import { Money } from "../../../src/shared/domain/value-objects/Money";
import { Slug } from "../../../src/shared/domain/value-objects/Slug";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { ValidationError } from "../../../src/shared/domain/errors/ValidationError";

describe("Email", () => {
  it("normalizes to lowercase and trims whitespace", () => {
    const email = Email.create("  Test.User@Example.COM  ");
    expect(email.value).toBe("test.user@example.com");
  });

  it("rejects invalid format", () => {
    expect(() => Email.create("not-an-email")).toThrow(ValidationError);
  });

  it("equality is structural", () => {
    expect(Email.create("a@b.co").equals(Email.create("A@B.CO"))).toBe(true);
  });
});

describe("Money", () => {
  it("stores integer cents only", () => {
    expect(() => Money.fromCents(1.5, "USD")).toThrow(ValidationError);
  });

  it("rejects negative amounts", () => {
    expect(() => Money.fromCents(-1, "USD")).toThrow(ValidationError);
  });

  it("rejects invalid currency code", () => {
    expect(() => Money.fromCents(100, "US")).toThrow(ValidationError);
  });

  it("adds same-currency amounts", () => {
    const a = Money.fromCents(500, "USD");
    const b = Money.fromCents(250, "USD");
    expect(a.add(b).amountCents).toBe(750);
  });

  it("rejects cross-currency addition", () => {
    const a = Money.fromCents(500, "USD");
    const b = Money.fromCents(250, "EUR");
    expect(() => a.add(b)).toThrow(ValidationError);
  });

  it("fromMajorUnits rounds to nearest cent", () => {
    expect(Money.fromMajorUnits(12.345, "USD").amountCents).toBe(1235);
  });
});

describe("UniqueId", () => {
  it("generates unique UUID v4 values", () => {
    const a = UniqueId.generate();
    const b = UniqueId.generate();
    expect(a.equals(b)).toBe(false);
  });

  it("parses valid UUID strings and lowercases them", () => {
    const id = UniqueId.fromString("550E8400-E29B-41D4-A716-446655440000");
    expect(id.value).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects invalid UUIDs", () => {
    expect(() => UniqueId.fromString("not-a-uuid")).toThrow(ValidationError);
  });
});

describe("Slug", () => {
  it("slugifies titles with diacritics and punctuation", () => {
    expect(Slug.fromTitle("Café del Mar — Summer 2026!").value).toBe(
      "cafe-del-mar-summer-2026",
    );
  });

  it("rejects invalid manually-provided slugs", () => {
    expect(() => Slug.create("Invalid Slug")).toThrow(ValidationError);
  });

  it("accepts valid kebab-case slugs", () => {
    expect(Slug.create("help-rebuild-2026").value).toBe("help-rebuild-2026");
  });
});
