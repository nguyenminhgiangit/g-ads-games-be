// import { redis } from '../helpers/redis.helper';
import { getRedis } from '../configs/redis.config';
import {
    Rate, Layout, sanitizeRates, computeQuotas,
    pickWeightedByRates, pieceIdToIndex
} from '../helpers/wheel.helper';

export async function getUsedMap(windowId: string): Promise<Record<number, number>> {
    const key = `spin:quota:used:${windowId}`;
    const map: Record<number, number> = {};
    const redis = getRedis();
    const data = await redis.hgetall(key);
    for (const [k, v] of Object.entries(data)) map[Number(k)] = Number(v);
    return map;
}

export function effectiveRatesByQuota(
    rates: Rate[],
    quotas: Record<number, number>,
    used: Record<number, number>
): Rate[] {
    return rates.map(r => {
        const remain = Math.max(0, (quotas[r.piece_id] ?? 0) - (used[r.piece_id] ?? 0));
        return { piece_id: r.piece_id, rate: remain > 0 ? r.rate : 0 };
    });
}

export async function spinWithRedisQuota(params: {
    rates: Rate[];
    layout: Layout;
    windowSize: number;        // ví dụ 1000
    windowId: string;          // ví dụ todayWindowId()
    ttlSeconds?: number;       // ví dụ đến cuối ngày
}) {
    const { rates, layout, windowSize, windowId, ttlSeconds } = params;

    const clean = sanitizeRates(rates, layout);
    const quotas = computeQuotas(clean, windowSize);

    const key = `spin:quota:used:${windowId}`;
    const used = await getUsedMap(windowId);

    let effective = effectiveRatesByQuota(clean, quotas, used);
    // nếu mọi weight = 0 (đủ quota trong cửa sổ) → fallback random theo tỉ lệ gốc
    if (effective.every(r => r.rate <= 0)) effective = clean;

    const pieceId = pickWeightedByRates(effective);

    // ghi nhận tăng đếm (atomic increment)
    const redis = getRedis();
    await redis.hincrby(key, String(pieceId), 1);
    if (ttlSeconds) await redis.expire(key, ttlSeconds);

    const index = pieceIdToIndex(pieceId, layout);
    const piece = layout[index];
    return piece;
}
