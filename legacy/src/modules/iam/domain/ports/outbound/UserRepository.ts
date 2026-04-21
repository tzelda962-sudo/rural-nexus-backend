import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Email } from "../../../../../shared/domain/value-objects/Email";
import { User } from "../../entities/User";

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UniqueId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
}
