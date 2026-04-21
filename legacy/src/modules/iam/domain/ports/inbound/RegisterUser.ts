import { UseCase } from "../../../../../shared/application/UseCase";

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterUserOutput {
  userId: string;
  email: string;
}

export interface RegisterUser extends UseCase<RegisterUserInput, RegisterUserOutput> {}
