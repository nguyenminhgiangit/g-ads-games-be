import { Piece, Rate, secondsUntilEndOfDay } from "../helpers/wheel.helper";
import { spinWithRedisQuota } from "./spin.quota.redis.atomic.service";

let pieces: Piece[] | null = null;

function shuffle<T>(array: T[]): T[] {
    let m = array.length, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        [array[m], array[i]] = [array[i], array[m]];
    }
    return array;
}

function initPiece() {
    if (!pieces) {
        const _pieces = Array.from({ length: 12 }, (_, i) => ({
            piece_id: i + 1,
            value: i + 1,
        }));
        pieces = shuffle([..._pieces]);
    }
    console.log('init pieces:', pieces);
    return pieces;
}

export function getPiece() {
    if (!pieces) {
        return initPiece();
    }
    return pieces;
}

export function resetPiece() {
    const _pieces = Array.from({ length: 12 }, (_, i) => ({
        piece_id: i + 1,
        value: i + 1,
    }));
    pieces = shuffle([..._pieces]);
    return pieces;
}

export function pickPiece(rates: Rate[]): Piece {
    const totalRate = rates.reduce((sum, r) => sum + r.rate, 0);
    let r = Math.random() * totalRate;

    for (const rate of rates) {
        r -= rate.rate;
        if (r <= 0) {
            // tìm piece tương ứng với piece_id
            const piece = pieces.find(p => p.piece_id === rate.piece_id);
            if (!piece) {
                throw new Error(`Piece ${rate.piece_id} not found in pieces`);
            }
            return piece;
        }
        // fallback: nếu có lỗi thì trả về phần tử cuối
        return pieces[pieces.length - 1];
    }
}
export async function pickPieceAtomic(rates: Rate[]) {
    try {
        const layout = getPiece();
        const windowId = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // TTL = đến 31-12-2025
        const ttl2025 = secondsUntilEndOfDay({ untilDate: new Date("2025-12-31") });

        // BẢN đơn giản:
        // const result = await spinWithRedisQuota({ rates, layout, windowSize: 1000, windowId, ttlSeconds: ttl });

        // BẢN atomic (Lua):
        const piece = await spinWithRedisQuota({ rates, layout, windowSize: 1000, windowId, ttlSeconds: ttl2025 }) ?? layout[layout.length - 1];

        console.log('spin result:', piece);
        return piece;
    } catch (e: any) {
        console.error('pickPieceAtomic err: ', e);
        // fallback: nếu có lỗi thì trả về phần tử cuối
        return pieces[pieces.length - 1];
    }
}