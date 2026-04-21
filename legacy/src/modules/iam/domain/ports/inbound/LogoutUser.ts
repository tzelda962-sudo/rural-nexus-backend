import { UseCase } from "../../../../../shared/application/UseCase";

export interface LogoutUserInput {
  refreshToken: string;
}

export interface LogoutUserOutput {
  revoked: boolean;
}

export interface LogoutUser extends UseCase<LogoutUserInput, LogoutUserOutput> {}
