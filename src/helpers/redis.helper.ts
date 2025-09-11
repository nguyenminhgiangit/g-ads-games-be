import { getRedis } from "../configs/redis.config";

const BLACKLIST_PREFIX = 'bl_token:';

export const blacklistRefreshToken = async (refreshToken: string, ttlSeconds: number) => {
    const redisClient = getRedis();
    await redisClient.set(`${BLACKLIST_PREFIX}${refreshToken}`, '1', 'EX', ttlSeconds);
};

export const isRefreshTokenBlacklisted = async (refreshToken: string): Promise<boolean> => {
    const redisClient = getRedis();
    const result = await redisClient.get(`${BLACKLIST_PREFIX}${refreshToken}`);
    return result === '1';
};
// import Redis from 'ioredis';
// export const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
