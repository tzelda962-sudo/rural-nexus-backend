import { ConflictError } from "../../../../shared/domain/errors/ConflictError";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { Email } from "../../../../shared/domain/value-objects/Email";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import { User } from "../../domain/entities/User";
import {
  RegisterUser,
  RegisterUserInput,
  RegisterUserOutput,
} from "../../domain/ports/inbound/RegisterUser";
import { PasswordHasher } from "../../domain/ports/outbound/PasswordHasher";
import { RoleRepository } from "../../domain/ports/outbound/RoleRepository";
import { UserRepository } from "../../domain/ports/outbound/UserRepository";

const MIN_PASSWORD_LENGTH = 12;

export class RegisterUserUseCase implements RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly roles: RoleRepository,
    private readonly hasher: PasswordHasher,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      );
    }

    const email = Email.create(input.email);

    if (await this.users.existsByEmail(email)) {
      throw new ConflictError(`Email already registered: ${email.value}`);
    }

    const hashedPassword = await this.hasher.hash(input.password);
    const user = User.register({
      email,
      hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    // New registrations default to DONOR role.
    const donorRole = await this.roles.findByName("DONOR");
    if (donorRole) {
      user.assignRole(donorRole);
    }

    await this.users.save(user);
    await this.eventBus.publishAll(user.pullEvents());

    return { userId: user.id.value, email: user.email.value };
  }
}
