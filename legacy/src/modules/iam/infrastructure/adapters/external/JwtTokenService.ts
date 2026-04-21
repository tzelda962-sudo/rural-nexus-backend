import { randomUUID } from "node:crypto";
import jwt, { Algorithm } from "jsonwebtoken";
import { Redis } from "ioredis";
import {
  AccessTokenClaims,
  RefreshSessionMeta,
  TokenService,
} from "../../../domain/ports/outbound/TokenService";

const REFRESH_KEY_PREFIX = "ngo:iam:refresh:";

export interface JwtTokenServiceConfig {
  privateKey: string;
  publicKey: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
  issuer: string;
  algorithm?: Algorithm;
}

interface RefreshRecord {
  userId: string;
  issuedAt: string;
  userAgent?: string;
  ipAddress?: string;
}

export class JwtTokenService implements TokenService {
  private readonly algorithm: Algorithm;

  constructor(
    private readonly config: JwtTokenServiceConfig,
    private readonly redis: Redis,
  ) {
    this.algorithm = config.algorithm ?? "RS256";
  }

  generateAccessToken(claims: AccessTokenClaims): {
    token: string;
    expiresIn: number;
  } {
    const token = jwt.sign(
      {
        sub: claims.userId,
        roles: claims.roles,
        permissions: claims.permissions,
      },
      this.config.privateKey,
      {
        algorithm: this.algorithm,
        expiresIn: this.config.accessTtlSeconds,
        issuer: this.config.issuer,
      },
    );
    return { token, expiresIn: this.config.accessTtlSeconds };
  }

  verifyAccessToken(token: string): AccessTokenClaims {
    const decoded = jwt.verify(token, this.config.publicKey, {
      algorithms: [this.algorithm],
      issuer: this.config.issuer,
    }) as jwt.JwtPayload & {
      roles?: string[];
      permissions?: string[];
    };

    if (!decoded.sub) {
      throw new Error("Access token missing subject");
    }
    return {
      userId: decoded.sub,
      roles: decoded.roles ?? [],
      permissions: decoded.permissions ?? [],
    };
  }

  async issueRefreshToken(
    meta: RefreshSessionMeta,
  ): Promise<{ token: string; expiresIn: number }> {
    const token = randomUUID();
    const record: RefreshRecord = {
      userId: meta.userId,
      issuedAt: meta.issuedAt.toISOString(),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    };
    await this.redis.set(
      `${REFRESH_KEY_PREFIX}${token}`,
      JSON.stringify(record),
      "EX",
      this.config.refreshTtlSeconds,
    );
    return { token, expiresIn: this.config.refreshTtlSeconds };
  }

  async lookupRefreshToken(token: string): Promise<RefreshSessionMeta | null> {
    const raw = await this.redis.get(`${REFRESH_KEY_PREFIX}${token}`);
    if (!raw) return null;
    try {
      const record = JSON.parse(raw) as RefreshRecord;
      return {
        userId: record.userId,
        issuedAt: new Date(record.issuedAt),
        userAgent: record.userAgent,
        ipAddress: record.ipAddress,
      };
    } catch {
      return null;
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.redis.del(`${REFRESH_KEY_PREFIX}${token}`);
  }
}
