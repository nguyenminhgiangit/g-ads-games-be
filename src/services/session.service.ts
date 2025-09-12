import { v4 as uuidv4 } from 'uuid';
import { buildTokenBundle, PlatformMeta, TokenBundle } from '../helpers/auth.helper';
import { Models } from '../models/model.registry';
import { REFRESH_TOKEN_EXPIRES_IN } from '../configs/auth.config';
import { generateAccessToken } from './token.service';
import { blacklistRefreshToken } from '../helpers/redis.helper';

/**
 * XÓA session cũ cùng (userId, deviceId, platform) → TẠO session mới → SINH access/refresh token.
 * KHÔNG trả user; nếu có oldRefreshToBlacklist thì đưa vào blacklist.
 */
export async function createOrReplaceSession(
  userId: string,
  role: string,
  meta: PlatformMeta,
  oldRefreshToBlacklist?: string
): Promise<TokenBundle> {
  await Models.Session.deleteMany({
    userId,
    deviceId: meta.deviceId,
    platform: meta.platform,
  });

  const refreshToken = uuidv4();
  const now = new Date();

  const session = await Models.Session.create({
    userId,
    deviceId: meta.deviceId,
    platform: meta.platform,
    refreshToken,
    ip: meta.ip,
    userAgent: meta.userAgent,
    createdAt: now,
    lastActiveAt: now,
    expiredAt: new Date(now.getTime() + REFRESH_TOKEN_EXPIRES_IN * 1000),
  });

  const accessToken = generateAccessToken(
    userId,
    session._id.toString(),
    meta.deviceId,
    meta.platform,
    role
  );

  if (oldRefreshToBlacklist) {
    await blacklistRefreshToken(oldRefreshToBlacklist, REFRESH_TOKEN_EXPIRES_IN);
  }

  return buildTokenBundle(accessToken, refreshToken);
}