import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Models } from '../models/model.registry';
import { blacklistRefreshToken, isRefreshTokenBlacklisted } from '../helpers/redis.helper';
import { generateAccessToken } from './token.service';
import { CounterKeys, nextCounterSequence } from './counter.service';

export const ACCESS_TOKEN_EXPIRES_IN = 15 * 60;            // 15 minutes
export const REFRESH_TOKEN_EXPIRES_IN = 30 * 24 * 60 * 60; // 30 days
const BCRYPT_ROUNDS = 10;

type PlatformMeta = {
  deviceId: string;
  platform: string;
  ip?: string;
  userAgent?: string;
};

type TokenBundle = {
  accessToken: string;
  refreshToken: string;
  accessTokenInfo: { issuedAt: string; expiresIn: number };
  refreshTokenInfo: { issuedAt: string; expiresIn: number };
  isNew?: boolean
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

/**
 * XÓA session cũ cùng (userId, deviceId, platform) → TẠO session mới → SINH access/refresh token.
 * KHÔNG trả user; nếu có oldRefreshToBlacklist thì đưa vào blacklist.
 */
async function createOrReplaceSession(
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

export const AuthService = {
  /** Đăng ký email/password cơ bản */
  async register(email: string, password: string) {
    if (await Models.User.findOne({ email })) throw new Error('Email already exists');
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await new Models.User({ email, passwordHash }).save();
    return { message: 'User registered successfully' };
  },

  /** Guest login bằng deviceId (login nhanh). Trả tokens (không trả user). */
  async guest(deviceId: string, platform: string, ip?: string, userAgent?: string) {
    let user = await Models.User.findOne({ guestId: deviceId });
    let isNew = false;
    if (!user) {
      const seq = await nextCounterSequence(CounterKeys.GUEST_ACCOUNT);
      user = await new Models.User({ guestId: deviceId, displayName: `Guest #${seq}` }).save();
      isNew = true;
    }

    const meta: PlatformMeta = { deviceId, platform, ip, userAgent };
    const resp = await createOrReplaceSession(user._id.toString(), user.role, meta);
    resp.isNew = isNew;
    return resp;
},

  /** Login email/password. Trả tokens (không trả user). */
  async login(
    email: string,
    password: string,
    deviceId: string,
    platform: string,
    ip?: string,
    userAgent?: string
  ) {
    const user = await Models.User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('Invalid credentials');

    const meta: PlatformMeta = { deviceId, platform, ip, userAgent };
    return createOrReplaceSession(user._id.toString(), user.role, meta);
  },

    /** Refresh access token (rotate refresh). Trả tokens (không trả user). */
    async refreshTokens(
      refreshToken: string,
      deviceId: string,
      platform: string,
      ip ?: string,
      userAgent ?: string
    ) {
  if (await isRefreshTokenBlacklisted(refreshToken)) {
    throw new Error('Token reuse detected. Logging out all devices.');
  }

  const session = await Models.Session.findOne({ deviceId, platform, refreshToken });
  if (!session) {
    await blacklistRefreshToken(refreshToken, REFRESH_TOKEN_EXPIRES_IN);
    throw new Error('Token reuse detected or already used.');
  }

  const user = await Models.User.findById(session.userId);
  if (!user) throw new Error('User not found');

  const meta: PlatformMeta = { deviceId, platform, ip, userAgent };
  return createOrReplaceSession(user._id.toString(), user.role, meta, refreshToken);
},

  /** Đổi mật khẩu → vô hiệu mọi session, buộc login lại */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await Models.User.findById(userId);
  if (!user) throw new Error('User not found');

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new Error('Incorrect current password');

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await user.save();

  await Models.Session.deleteMany({ userId });
  return { message: 'Password changed, please login again.' };
},

  /** Logout 1 thiết bị (xóa session theo userId + deviceId + platform) */
  async logout(userId: string, deviceId: string, platform: string) {
  await Models.Session.deleteOne({ userId, deviceId, platform });
},

  /** Logout tất cả thiết bị (blacklist refresh hiện có + xóa tất cả session) */
  async logoutAllDevices(userId: string) {
  const sessions = await Models.Session.find({ userId });
  await Promise.all(
    sessions.map(s => blacklistRefreshToken(s.refreshToken, REFRESH_TOKEN_EXPIRES_IN))
  );
  await Models.Session.deleteMany({ userId });
},

  /** Liệt kê session (ẩn refreshToken) */
  async listSessions(userId: string) {
  return Models.Session.find({ userId }).select('-refreshToken');
},
};
