export interface AccessTokenClaims {
  userId: string;
  roles: string[];
  permissions: string[];
}

export interface RefreshSessionMeta {
  userId: string;
  issuedAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface TokenService {
  /** Issue a short-lived signed JWT. */
  generateAccessToken(claims: AccessTokenClaims): { token: string; expiresIn: number };

  /** Issue an opaque refresh token and persist its session metadata. */
  issueRefreshToken(meta: RefreshSessionMeta): Promise<{ token: string; expiresIn: number }>;

  /** Verify a signed access JWT and return its claims; throws on invalid/expired. */
  verifyAccessToken(token: string): AccessTokenClaims;

  /** Look up the session for an opaque refresh token; returns null if unknown/expired. */
  lookupRefreshToken(token: string): Promise<RefreshSessionMeta | null>;

  /** Revoke (delete) a refresh token. Idempotent. */
  revokeRefreshToken(token: string): Promise<void>;
}
