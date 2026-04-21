import { UnauthenticatedError } from "../../../../shared/domain/errors/AuthorizationError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";
import {
  RefreshTokenInput,
  RefreshTokenOutput,
  RefreshTokenUseCaseI,
} from "../../domain/ports/inbound/RefreshToken";
import { TokenService } from "../../domain/ports/outbound/TokenService";
import { UserRepository } from "../../domain/ports/outbound/UserRepository";

export class RefreshTokenUseCase implements RefreshTokenUseCaseI {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const session = await this.tokens.lookupRefreshToken(input.refreshToken);
    if (!session) {
      throw new UnauthenticatedError("Invalid or expired refresh token");
    }

    // Load the user fresh so revocations (role removal, deactivation) take effect.
    const user = await this.users.findById(UniqueId.fromString(session.userId));
    if (!user || !user.isActive) {
      await this.tokens.revokeRefreshToken(input.refreshToken);
      throw new UnauthenticatedError("Account no longer active");
    }

    // Rotate: revoke old, issue new pair.
    await this.tokens.revokeRefreshToken(input.refreshToken);

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

    return {
      accessToken: access.token,
      refreshToken: refresh.token,
      expiresIn: access.expiresIn,
    };
  }
}
