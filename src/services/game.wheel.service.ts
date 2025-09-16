import { getRedis } from "../configs/redis.config";
import { DEFAULT_CLAIMINGS, DEFAULT_MAX_SPINS, DEFAULT_PIECES } from "../configs/wheel.config";
import { secondsUntilEndOfDay } from "../helpers/wheel.helper";
import { WheelMeta, WheelMilestone, WheelPiece } from "../types/wheel.type";
import { pickPieceAtomic } from "./game.wheel.pick.service";

let _wheelPieces: WheelPiece[] = null;
let _claimMilestones: WheelMilestone[] = null;
let _maxSpin: number = undefined;

/**
 * (Hiện hard-code) Có thể thay bằng load từ DB: Models.WheelConfig.findOne({ active: true })
 * nếu có order[], hãy map lại để pieces theo đúng thứ tự hiển thị.
 */
function loadWheelPiecesConfig(): WheelPiece[] {
    const _pieces = DEFAULT_PIECES;
    const pieces = shuffle([..._pieces]);
    return pieces;
}
function loadClaimMilestonesConfig(): WheelMilestone[] {
    const claims = DEFAULT_CLAIMINGS;
    return claims;
}
function loadMaxSpinConfig(): number {
    return DEFAULT_MAX_SPINS;
}
function shuffle<T>(array: T[]): T[] {
    let m = array.length, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        [array[m], array[i]] = [array[i], array[m]];
    }
    return array;
}

export const WheelService = {
    id: "wheel" as const,

    getDefaultMaxSpins(): number {
        if (!_maxSpin) _maxSpin = loadMaxSpinConfig();
        return _maxSpin;
    },
    getClaimMilestones(): WheelMilestone[] {
        if (!_claimMilestones) _claimMilestones = loadClaimMilestonesConfig();
        return _claimMilestones;
    },
    getMeta(): WheelMeta {
        if (!_wheelPieces) _wheelPieces = loadWheelPiecesConfig();
        if (!_claimMilestones) _claimMilestones = loadClaimMilestonesConfig();
        if (!_maxSpin) _maxSpin = loadMaxSpinConfig();

        return { id: "wheel", pieces: _wheelPieces, claims: _claimMilestones, maxSpin: _maxSpin };
    },
    getClaimMinetons(): number {
        return DEFAULT_MAX_SPINS;
    },
};

export async function pickPiece(pieces: WheelPiece[]): Promise<WheelPiece> {
    try {
        const windowId = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const redis = getRedis();
        const redisKey = `spin:quota:used:${windowId}`;
        const windowSize = 1000;
        //đến 31-12-2025
        const ttlSeconds = secondsUntilEndOfDay({ untilDate: new Date("2025-12-31") });
        const piece = await pickPieceAtomic(redis, redisKey, pieces, windowSize, ttlSeconds) ?? pieces[pieces.length - 1];
        return piece;
    } catch (e: any) {
        console.error('pickPieceAtomic err: ', e);
        // fallback: nếu có lỗi thì trả về phần tử cuối
        return pieces[pieces.length - 1];
    }
}
