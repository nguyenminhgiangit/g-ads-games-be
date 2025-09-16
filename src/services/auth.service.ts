import bcrypt from 'bcrypt';
import { Models } from '../models/model.registry';
import { blacklistRefreshToken, isRefreshTokenBlacklisted } from '../helpers/redis.helper';
import { CounterKeys, nextCounterSequence } from './counter.service';
import { BCRYPT_ROUNDS, REFRESH_TOKEN_EXPIRES_IN } from '../configs/auth.config';
import { createOrReplaceSession } from './session.service';
import { PlatformMeta } from '../types/auth.type';


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
    ip?: string,
    userAgent?: string
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
