import bcrypt from "bcryptjs";
import { HashedPassword } from "../../../domain/value-objects/HashedPassword";
import { PasswordHasher } from "../../../domain/ports/outbound/PasswordHasher";

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly rounds = 12) {}

  async hash(plainPassword: string): Promise<HashedPassword> {
    const hash = await bcrypt.hash(plainPassword, this.rounds);
    return HashedPassword.fromHash(hash);
  }

  async verify(plainPassword: string, hashed: HashedPassword): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashed.value);
  }
}
