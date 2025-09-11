// types
export type Rate = { piece_id: number; rate: number };
export type Piece = { piece_id: number; value: number };
export type Layout = Piece[];

export function sanitizeRates(rates: Rate[], layout: Layout): Rate[] {
    const ids = new Set(layout.map(p => p.piece_id));
    const cleaned = rates.filter(r => ids.has(r.piece_id) && r.rate >= 0);
    const sum = cleaned.reduce((s, r) => s + r.rate, 0);
    if (sum <= 0) {
        const eq = 1 / cleaned.length;
        return cleaned.map(r => ({ ...r, rate: eq }));
    }
    return cleaned;
}

export function pieceIdToIndex(pieceId: number, layout: Layout) {
    const i = layout.findIndex(p => p.piece_id === pieceId);
    if (i < 0) throw new Error(`piece_id ${pieceId} not in layout`);
    return i;
}

export function computeQuotas(rates: Rate[], WINDOW_SIZE: number) {
    const total = rates.reduce((s, r) => s + r.rate, 0);
    const quotas: Record<number, number> = {};
    for (const r of rates) quotas[r.piece_id] = Math.floor((r.rate / total) * WINDOW_SIZE);
    // cân bằng để tổng đúng WINDOW_SIZE
    let assigned = Object.values(quotas).reduce((s, v) => s + v, 0);
    let i = 0;
    while (assigned < WINDOW_SIZE) {
        quotas[rates[i % rates.length].piece_id]++;
        assigned++; i++;
    }
    return quotas;
}

export function pickWeightedByRates(rates: Rate[]): number {
    const total = rates.reduce((s, r) => s + r.rate, 0);
    if (total <= 0) return rates[Math.floor(Math.random() * rates.length)].piece_id;
    let r = Math.random() * total;
    for (const it of rates) { r -= it.rate; if (r <= 0) return it.piece_id; }
    return rates[rates.length - 1].piece_id;
}

/**
 * 
 *  // hết ngày (mặc định)
    const ttl = secondsUntilEndOfDay();
    // TTL = 10 ngày - N ngày
    const ttl10 = secondsUntilEndOfDay({ days: 10 });
    // TTL = đến 31-12-2025
    const ttl2025 = secondsUntilEndOfDay({ untilDate: new Date("2025-12-31") });
 */
export function secondsUntilEndOfDay(options?: { days?: number; untilDate?: Date }): number {
    const now = new Date();

    if (options?.untilDate) {
        // đến thời điểm cuối ngày untilDate
        const end = new Date(options.untilDate);
        end.setHours(23, 59, 59, 999);
        return Math.max(1, Math.floor((end.getTime() - now.getTime()) / 1000));
    }

    if (options?.days) {
        // đến hết ngày sau N ngày
        const end = new Date(now);
        end.setDate(end.getDate() + options.days);
        end.setHours(23, 59, 59, 999);
        return Math.max(1, Math.floor((end.getTime() - now.getTime()) / 1000));
    }

    // mặc định hết ngày này
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    return Math.max(1, Math.floor((end.getTime() - now.getTime()) / 1000));
}

