import { error } from "console";
import { getRedis } from "../configs/redis.config";
import { DEFAULT_CLAIMINGS, DEFAULT_MAX_SPINS, DEFAULT_PIECES } from "../configs/wheel.config";
import { loadDefaultClaimMilestones, loadDefaultMaxSpin, loadDefaultWheelPieces, makeDistKey, makeIndexKey, secondsUntilEndOfDay, shuffle, toVersion } from "../helpers/wheel.helper";
import { Models } from "../models/model.registry";
import { WheelMeta, WheelMilestone, WheelPiece } from "../types/wheel.type";
import { pickPieceAtomic } from "./game.wheel.pick.service";

let _wheelPieces: WheelPiece[] = null;
let _claimMilestones: WheelMilestone[] = null;
let _maxSpin: number = undefined;

export const WheelService = {
    id: "wheel" as const,

    getMaxSpins(): number {
        if (!_maxSpin) _maxSpin = loadDefaultMaxSpin();
        return _maxSpin;
    },
    getClaimMilestones(): WheelMilestone[] {
        if (!_claimMilestones) _claimMilestones = loadDefaultClaimMilestones();
        return _claimMilestones;
    },
    getMeta(): WheelMeta {
        if (!_wheelPieces) _wheelPieces = loadDefaultWheelPieces();
        if (!_claimMilestones) _claimMilestones = this.getClaimMilestones();
        if (!_maxSpin) _maxSpin = loadDefaultMaxSpin();

        return { id: this.id, pieces: _wheelPieces, claims: _claimMilestones, maxSpin: _maxSpin };
    },
    async initConfigs(): Promise<WheelMeta> {
        try {
            const gameId = this.id;
            let configs = await Models.GameConfig.findOne({ gameId });
            if (configs) {
                console.log(` ✅ ${gameId}'s config is ready.. `);
            }
            else {
                const pieces = shuffle([...DEFAULT_PIECES]);
                configs = await Models.GameConfig.create({
                    gameId,
                    version: toVersion(),
                    status: "published",
                    pieces,
                    claims: DEFAULT_CLAIMINGS,
                    maxSpin: DEFAULT_MAX_SPINS,
                    effectiveAt: null,                // áp dụng ngay
                    createdBy: "system",
                    publishedAt: new Date(),
                });
                console.log(` ✅ ${gameId}'s config is created new.. `);
            }

            _maxSpin = configs.maxSpin;
            _claimMilestones = configs.claims;
            _wheelPieces = configs.pieces;

            return this.getMeta();
        }
        catch (err) {
            console.log('initConfigs err: ', err);
            return this.getMeta();;
        }
    },
    async updateConfigs(payload: WheelMeta): Promise<any> {
        try {
            const { id, pieces, claims, maxSpin } = payload;
            const exist = await Models.GameConfig.find({ gameId: id, pieces, claims, maxSpin });
            const isExist = exist.length > 0;

            //config có điểm khác
            if (isExist === false) {
                const version = toVersion();
                const updated = await Models.GameConfig.findOneAndUpdate(
                    { gameId: this.id },
                    { $set: { pieces, claims, maxSpin, version } },
                    { new: true, upsert: true }
                );

                _maxSpin = updated.maxSpin;
                _claimMilestones = updated.claims;
                _wheelPieces = updated.pieces;
            }

            await resetPickDistribution();
            let message = isExist === true ? 'Current config was same. No changed!' : 'Config updated!';
            message = `${message} New campain started.`
            return {
                ok: true,
                message
            };
        }
        catch (err: any) {
            console.log('Updating config failed err: ', err);
            return { ok: false, error: err.message ?? 'Updating config failed.' };
        }
    }
};

export async function pickPiece(pieces: WheelPiece[]): Promise<WheelPiece> {
    try {
        const windowId = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const redis = getRedis();
        // const redisKey = `spin:quota:used:${windowId}`;
        const redisKey = makeDistKey(`day:${windowId}`);
        const windowSize = 1000;

        // lưu key vào index set để hỗ trợ reset sau này
        await redis.sadd(makeIndexKey(), redisKey);
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

export async function resetPickDistribution() {
    const indexKey = makeIndexKey();
    const redis = getRedis();
    // Xóa tất cả phiên bản của 1 game (không dùng SCAN cho Cluster)
    const keys = await redis.smembers(indexKey);
    if (keys.length) {
        // DEL theo lô (Redis giới hạn ~10k args/lần, ở đây thường ít)
        const BATCH = 500;
        for (let i = 0; i < keys.length; i += BATCH) {
            await redis.del(...keys.slice(i, i + BATCH));
        }
        await redis.del(indexKey); // clear index set
    }
}