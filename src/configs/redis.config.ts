import Redis from 'ioredis';

let redisClient: Redis | null = null;

export const initRedis = async () => {
    const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    });

    return new Promise<Redis>((resolve, reject) => {
        redis.on('connect', () => {
            console.log('✅ Redis connected');
            redisClient = redis;
            resolve(redis);
        });

        redis.on('error', (err) => {
            console.error('❌ [Redis] Connection error:', err);
            reject(err);
        });
    });
};

export const getRedis = (): Redis => {
    if (!redisClient) {
        throw new Error('Redis not initialized yet');
    }
    return redisClient;
};
