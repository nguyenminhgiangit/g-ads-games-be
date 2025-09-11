import { v4 as uuidv4 } from 'uuid';
import { Models } from '../models/model.registry';
import { blacklistRefreshToken } from './redis.helper';
import { generateAccessToken } from '../services/token.service';

export const ACCESS_TOKEN_EXPIRES_IN = 15 * 60;                // 15m
export const REFRESH_TOKEN_EXPIRES_IN = 30 * 24 * 60 * 60;     // 30d
export const BCRYPT_ROUNDS = 10;

type PlatformMeta = { deviceId: string; platform: string; ip?: string; userAgent?: string };
type TokenBundle = {
    accessToken: string;
    refreshToken: string;
    accessTokenInfo: { issuedAt: string; expiresIn: number };
    refreshTokenInfo: { issuedAt: string; expiresIn: number };
};

function nowIso() {
    return new Date().toISOString();
}

function buildTokenBundle(accessToken: string, refreshToken: string): TokenBundle {
    const issuedAt = nowIso();
    return {
        accessToken,
        refreshToken,
        accessTokenInfo: { issuedAt, expiresIn: ACCESS_TOKEN_EXPIRES_IN },
        refreshTokenInfo: { issuedAt, expiresIn: REFRESH_TOKEN_EXPIRES_IN },
    };
}

export async function createOrReplaceSession(
    userId: string,
    role: string,
    meta: PlatformMeta,
    oldRefreshToBlacklist?: string
) {
    // bỏ session cũ cùng device/platform để tránh trùng
    await Models.Session.deleteMany({ userId, deviceId: meta.deviceId, platform: meta.platform });

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

    const accessToken = generateAccessToken(userId, session._id.toString(), meta.deviceId, meta.platform, role);

    if (oldRefreshToBlacklist) {
        await blacklistRefreshToken(oldRefreshToBlacklist, REFRESH_TOKEN_EXPIRES_IN);
    }

    return { session, ...buildTokenBundle(accessToken, refreshToken) };
}
