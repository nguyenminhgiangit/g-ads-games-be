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

