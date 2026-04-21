import { UseCase } from "../../../../../shared/application/UseCase";

export interface LoginUserInput {
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}

export interface LoginUserOutput {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
  };
}

export interface LoginUser extends UseCase<LoginUserInput, LoginUserOutput> {}
