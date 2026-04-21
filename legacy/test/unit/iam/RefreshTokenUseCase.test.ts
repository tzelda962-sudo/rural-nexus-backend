import { beforeEach, describe, expect, it } from "vitest";
import { Email } from "../../../src/shared/domain/value-objects/Email";
import { UniqueId } from "../../../src/shared/domain/value-objects/UniqueId";
import { UnauthenticatedError } from "../../../src/shared/domain/errors/AuthorizationError";
import { RefreshTokenUseCase } from "../../../src/modules/iam/application/use-cases/RefreshTokenUseCase";
import { Role } from "../../../src/modules/iam/domain/entities/Role";
import { User } from "../../../src/modules/iam/domain/entities/User";
import { HashedPassword } from "../../../src/modules/iam/domain/value-objects/HashedPassword";
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

class InMemoryTokenService implements TokenService {
  private sessions = new Map<string, RefreshSessionMeta>();
  private counter = 0;

  generateAccessToken(claims: AccessTokenClaims): {
    token: string;
    expiresIn: number;
  } {
    return { token: `access-for-${claims.userId}`, expiresIn: 900 };
  }

  async issueRefreshToken(
    meta: RefreshSessionMeta,
  ): Promise<{ token: string; expiresIn: number }> {
    this.counter += 1;
    const token = `refresh-${this.counter}`;
    this.sessions.set(token, meta);
    return { token, expiresIn: 604800 };
  }

  verifyAccessToken(_token: string): AccessTokenClaims {
    return { userId: "u", roles: [], permissions: [] };
  }

  async lookupRefreshToken(
    token: string,
  ): Promise<RefreshSessionMeta | null> {
    return this.sessions.get(token) ?? null;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  has(token: string): boolean {
    return this.sessions.has(token);
  }
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
  user.pullEvents();
  await repo.save(user);
  return user;
}

describe("RefreshTokenUseCase", () => {
  let users: InMemoryUserRepository;
  let tokens: InMemoryTokenService;
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    tokens = new InMemoryTokenService();
    useCase = new RefreshTokenUseCase(users, tokens);
  });

  it("revokes the old refresh token and issues a new pair", async () => {
    const user = await seedUser(users);
    const initial = await tokens.issueRefreshToken({
      userId: user.id.value,
      issuedAt: new Date(),
      ipAddress: "127.0.0.1",
    });

    const result = await useCase.execute({
      refreshToken: initial.token,
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
    });

    expect(tokens.has(initial.token)).toBe(false); // old revoked
    expect(result.refreshToken).not.toBe(initial.token); // rotated
    expect(tokens.has(result.refreshToken)).toBe(true); // new persisted
    expect(result.accessToken).toBe(`access-for-${user.id.value}`);
  });

  it("rejects an unknown refresh token", async () => {
    await expect(
      useCase.execute({
        refreshToken: "does-not-exist",
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("revokes the token and rejects login when the user is deactivated", async () => {
    const user = await seedUser(users);
    const initial = await tokens.issueRefreshToken({
      userId: user.id.value,
      issuedAt: new Date(),
    });
    user.deactivate();
    await users.save(user);

    await expect(
      useCase.execute({
        refreshToken: initial.token,
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      }),
    ).rejects.toThrow(/no longer active/i);

    expect(tokens.has(initial.token)).toBe(false);
  });
});
