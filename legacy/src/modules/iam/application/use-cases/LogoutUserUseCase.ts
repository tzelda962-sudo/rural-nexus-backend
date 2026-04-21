import {
  LogoutUser,
  LogoutUserInput,
  LogoutUserOutput,
} from "../../domain/ports/inbound/LogoutUser";
import { TokenService } from "../../domain/ports/outbound/TokenService";

export class LogoutUserUseCase implements LogoutUser {
  constructor(private readonly tokens: TokenService) {}

  async execute(input: LogoutUserInput): Promise<LogoutUserOutput> {
    await this.tokens.revokeRefreshToken(input.refreshToken);
    return { revoked: true };
  }
}
