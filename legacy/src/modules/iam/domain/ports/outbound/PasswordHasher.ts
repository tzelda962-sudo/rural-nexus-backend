import { HashedPassword } from "../../value-objects/HashedPassword";

export interface PasswordHasher {
  hash(plainPassword: string): Promise<HashedPassword>;
  verify(plainPassword: string, hashed: HashedPassword): Promise<boolean>;
}
