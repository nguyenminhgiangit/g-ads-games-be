import { DEFAULT_CLAIMINGS, DEFAULT_MAX_SPINS, DEFAULT_PIECES } from "../configs/wheel.config";
import { WheelMilestone, WheelPiece } from "../types/wheel.type";

export function loadDefaultWheelPieces(): WheelPiece[] {
    const pieces = shuffle([...DEFAULT_PIECES]);
    return pieces;
}
export function loadDefaultClaimMilestones(): WheelMilestone[] {
    return DEFAULT_CLAIMINGS;
}
export function loadDefaultMaxSpin(): number {
    return DEFAULT_MAX_SPINS;
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

export function toVersion() {
    return new Date().toISOString().replace(/[:.]/g, "-"); // ví dụ: 2025-09-17T03-22-10-123Z
}

export function shuffle<T>(array: T[]): T[] {
    let m = array.length, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        [array[m], array[i]] = [array[i], array[m]];
    }
    return array;
}


export function makeDistKey(suffix: string) {
    // hash-tag {gameId} để tất cả ops cùng slot trong Redis Cluster
    return `wheel:dist:{quota:used}:${suffix}`;
}
export function makeIndexKey() {
    return `wheel:dist:{quota:used}:__index`;
}

export function getReachedMilestone(milestone: number, claims = DEFAULT_CLAIMINGS): WheelMilestone | null {
  // đảm bảo đã sort theo reward tăng dần
  const sorted = [...claims].sort((a, b) => a.reward - b.reward);
  let hit: WheelMilestone | null = null;
  for (const c of sorted) if (milestone >= c.reward) hit = c; else break;
  return hit;
}
