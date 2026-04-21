import { DomainError } from "./DomainError";

export class AuthorizationError extends DomainError {
  readonly code = "FORBIDDEN";
  readonly httpStatus = 403;
}

export class UnauthenticatedError extends DomainError {
  readonly code = "UNAUTHENTICATED";
  readonly httpStatus = 401;
}
