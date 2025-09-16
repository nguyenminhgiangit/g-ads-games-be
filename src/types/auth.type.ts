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