import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../configs/auth.config";

export type PlatformMeta = {
  deviceId: string;
  platform: string;
  ip?: string;
  userAgent?: string;
};

export type TokenBundle = {
  accessToken: string;
  refreshToken: string;
  accessTokenInfo: { issuedAt: string; expiresIn: number };
  refreshTokenInfo: { issuedAt: string; expiresIn: number };
  isNew?: boolean
};

function nowIso() {
  return new Date().toISOString();
}

export function buildTokenBundle(accessToken: string, refreshToken: string): TokenBundle {
  const issuedAt = nowIso();
  return {
    accessToken,
    refreshToken,
    accessTokenInfo: { issuedAt, expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    refreshTokenInfo: { issuedAt, expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  };
}

