import { ValidationError } from "../../../../shared/domain/errors/ValidationError";

/**
 * Opaque wrapper around a pre-hashed password.
 * The domain never sees plaintext — plaintext only enters via PasswordHasher
 * at the adapter boundary.
 */
export class HashedPassword {
  private constructor(readonly value: string) {}

  static fromHash(hash: string): HashedPassword {
    if (typeof hash !== "string" || hash.length < 20) {
      throw new ValidationError("HashedPassword must be a non-trivial hash string");
    }
    return new HashedPassword(hash);
  }
}
