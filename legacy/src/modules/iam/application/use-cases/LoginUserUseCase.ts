import { UnauthenticatedError } from "../../../../shared/domain/errors/AuthorizationError";
import { Email } from "../../../../shared/domain/value-objects/Email";
import { EventBus } from "../../../../shared/domain/events/EventBus";
import {
  LoginUser,
  LoginUserInput,
  LoginUserOutput,
} from "../../domain/ports/inbound/LoginUser";
import { PasswordHasher } from "../../domain/ports/outbound/PasswordHasher";
import { TokenService } from "../../domain/ports/outbound/TokenService";
import { UserRepository } from "../../domain/ports/outbound/UserRepository";

export class LoginUserUseCase implements LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // Parse email without leaking which branch we took — same error on all failures.
    let email: Email;
    try {
      email = Email.create(input.email);
    } catch {
      throw new UnauthenticatedError("Invalid credentials");
    }

    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    if (user.isLocked()) {
      throw new UnauthenticatedError(
        "Account is temporarily locked due to failed login attempts",
      );
    }

    if (!user.isActive) {
      throw new UnauthenticatedError("Account is deactivated");
    }

    const ok = await this.hasher.verify(input.password, user.hashedPassword);
    if (!ok) {
      user.recordFailedLogin();
      await this.users.save(user);
      throw new UnauthenticatedError("Invalid credentials");
    }

    user.recordSuccessfulLogin({ ipAddress: input.ipAddress });

    const permissions = user.allPermissions();
    const roleNames = user.roles.map((r) => r.name);

    const access = this.tokens.generateAccessToken({
      userId: user.id.value,
      roles: roleNames,
      permissions,
    });

    const refresh = await this.tokens.issueRefreshToken({
      userId: user.id.value,
      issuedAt: new Date(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    await this.users.save(user);
    await this.eventBus.publishAll(user.pullEvents());

    return {
      accessToken: access.token,
      refreshToken: refresh.token,
      expiresIn: access.expiresIn,
      user: {
        id: user.id.value,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: roleNames,
        permissions,
      },
    };
  }
}
