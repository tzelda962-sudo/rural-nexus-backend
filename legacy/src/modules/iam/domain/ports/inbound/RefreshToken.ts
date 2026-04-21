import { UseCase } from "../../../../../shared/application/UseCase";

export interface RefreshTokenInput {
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenUseCaseI
  extends UseCase<RefreshTokenInput, RefreshTokenOutput> {}
