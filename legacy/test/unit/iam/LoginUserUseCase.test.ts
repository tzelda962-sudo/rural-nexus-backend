import { beforeEach, describe, expect, it } from "vitest";
import { Email } from "../../../src/shared/domain/value-objects/Email";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { UnauthenticatedError } from "../../../src/shared/domain/errors/AuthorizationError";
import { InMemoryEventBus } from "../../../src/shared/infrastructure/events/InMemoryEventBus";
import { LoginUserUseCase } from "../../../src/modules/iam/application/use-cases/LoginUserUseCase";
import { Role } from "../../../src/modules/iam/domain/entities/Role";
import {
  MAX_FAILED_ATTEMPTS,
  User,
} from "../../../src/modules/iam/domain/entities/User";
import { HashedPassword } from "../../../src/modules/iam/domain/value-objects/HashedPassword";
import { PasswordHasher } from "../../../src/modules/iam/domain/ports/outbound/PasswordHasher";
import { UserRepository } from "../../../src/modules/iam/domain/ports/outbound/UserRepository";
import {
  AccessTokenClaims,
  RefreshSessionMeta,
  TokenService,
} from "../../../src/modules/iam/domain/ports/outbound/TokenService";

const HASH = HashedPassword.fromHash(
  "$2a$12$abcdefghijklmnopqrstuv.WXYZ0123456789abcdefghijklmnop",
);

class InMemoryUserRepository implements UserRepository {
  private byId = new Map<string, User>();
  private byEmail = new Map<string, string>();

  async save(user: User): Promise<void> {
    this.byId.set(user.id.value, user);
    this.byEmail.set(user.email.value, user.id.value);
  }
  async findById(id: UniqueId): Promise<User | null> {
    return this.byId.get(id.value) ?? null;
  }
  async findByEmail(email: Email): Promise<User | null> {
    const id = this.byEmail.get(email.value);
    return id ? (this.byId.get(id) ?? null) : null;
  }
  async existsByEmail(email: Email): Promise<boolean> {
    return this.byEmail.has(email.value);
  }
}

class StubPasswordHasher implements PasswordHasher {
  constructor(public matches: boolean) {}
  async hash(_plain: string): Promise<HashedPassword> {
    return HASH;
  }
  async verify(_plain: string, _hashed: HashedPassword): Promise<boolean> {
    return this.matches;
  }
}

class StubTokenService implements TokenService {
  public issued = 0;
  generateAccessToken(_claims: AccessTokenClaims): {
    token: string;
    expiresIn: number;
  } {
    return { token: "access-token", expiresIn: 900 };
  }
  async issueRefreshToken(
    _meta: RefreshSessionMeta,
  ): Promise<{ token: string; expiresIn: number }> {
    this.issued += 1;
    return { token: `refresh-${this.issued}`, expiresIn: 604800 };
  }
  verifyAccessToken(_token: string): AccessTokenClaims {
    return { userId: "u", roles: [], permissions: [] };
  }
  async lookupRefreshToken(
    _token: string,
  ): Promise<RefreshSessionMeta | null> {
    return null;
  }
  async revokeRefreshToken(_token: string): Promise<void> {}
}

async function seedUser(repo: InMemoryUserRepository): Promise<User> {
  const user = User.register({
    email: Email.create("alice@example.com"),
    hashedPassword: HASH,
    firstName: "Alice",
    lastName: "Anderson",
  });
  user.assignRole(
    Role.create(UniqueId.generate(), "DONOR", "Donor", ["donations:read"], true),
  );
  user.pullEvents(); // drain creation events
  await repo.save(user);
  return user;
}

describe("LoginUserUseCase", () => {
  let users: InMemoryUserRepository;
  let tokens: StubTokenService;
  let bus: InMemoryEventBus;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    tokens = new StubTokenService();
    bus = new InMemoryEventBus();
  });

  it("issues an access + refresh token pair on success", async () => {
    await seedUser(users);
    const useCase = new LoginUserUseCase(
      users,
      new StubPasswordHasher(true),
      tokens,
      bus,
    );

    const result = await useCase.execute({
      email: "alice@example.com",
      password: "correct-horse",
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
    });

    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-1");
    expect(result.user.email).toBe("alice@example.com");
    expect(result.user.roles).toEqual(["DONOR"]);
    expect(result.user.permissions).toEqual(["donations:read"]);
  });

  it("returns generic 'Invalid credentials' for unknown email", async () => {
    const useCase = new LoginUserUseCase(
      users,
      new StubPasswordHasher(true),
      tokens,
      bus,
    );
    await expect(
      useCase.execute({
        email: "nope@example.com",
        password: "x",
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("increments failed attempts on bad password and persists", async () => {
    const user = await seedUser(users);
    const useCase = new LoginUserUseCase(
      users,
      new StubPasswordHasher(false),
      tokens,
      bus,
    );
    await expect(
      useCase.execute({
        email: "alice@example.com",
        password: "wrong",
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedError);

    const reloaded = await users.findById(user.id);
    expect(reloaded?.failedLoginAttempts).toBe(1);
  });

  it("locks the account after MAX_FAILED_ATTEMPTS bad logins", async () => {
    const user = await seedUser(users);
    const useCase = new LoginUserUseCase(
      users,
      new StubPasswordHasher(false),
      tokens,
      bus,
    );

    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i += 1) {
      await expect(
        useCase.execute({
          email: "alice@example.com",
          password: "wrong",
          ipAddress: "127.0.0.1",
          userAgent: "vitest",
        }),
      ).rejects.toBeInstanceOf(UnauthenticatedError);
    }

    const reloaded = await users.findById(user.id);
    expect(reloaded?.isLocked()).toBe(true);

    // Even with the correct password, login is blocked while locked.
    const goodHasher = new StubPasswordHasher(true);
    const goodUseCase = new LoginUserUseCase(users, goodHasher, tokens, bus);
    await expect(
      goodUseCase.execute({
        email: "alice@example.com",
        password: "correct-horse",
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      }),
    ).rejects.toThrow(/locked/i);
  });

  it("rejects login for deactivated accounts", async () => {
    const user = await seedUser(users);
    user.deactivate();
    await users.save(user);

    const useCase = new LoginUserUseCase(
      users,
      new StubPasswordHasher(true),
      tokens,
      bus,
    );
    await expect(
      useCase.execute({
        email: "alice@example.com",
        password: "correct-horse",
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      }),
    ).rejects.toThrow(/deactivated/i);
  });
});
