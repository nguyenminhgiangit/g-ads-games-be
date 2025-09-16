import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../configs/auth.config";
import { TokenBundle } from "../types/auth.type";

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

