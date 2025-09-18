import { ActivityType, BaseLog, ClaimPayload, LogParams, ResetPayload, SpinPayload } from "../types/activity.log.type";
import { IActivityLog } from "../models/activity.log.model";
import { Models } from "../models/model.registry";

/** Ghi 1 activity (spin | reset | claim). Trả về document đã lưu (lean object). */
export async function logActivity(params: LogParams): Promise<IActivityLog> {
    const ActivityLog = Models.ActivityLog;

    const doc = await ActivityLog.create({
        gameId: params.gameId,
        playerId: String(params.playerId),
        type: params.type as ActivityType,
        before: params.before ? { ...params.before } : undefined,
        after: params.after ? { ...params.after } : undefined,
        payload: params.payload ? { ...params.payload } : undefined,
    });
    // trả lean cho nhẹ (nếu bạn muốn giữ document mongoose thì bỏ .toObject())
    return doc.toObject();
}

// ---------- helpers tiện dụng ----------

export async function logSpin(params: BaseLog & SpinPayload) {
    return logActivity({
        type: "spin",
        gameId: params.gameId,
        playerId: params.playerId,
        before: params.before,
        after: params.after,
        payload: { pieceId: params.pieceId, pieceReward: params.pieceReward }
    });
}

export async function logReset(params: BaseLog & ResetPayload) {
    return logActivity({
        type: "reset",
        gameId: params.gameId,
        playerId: params.playerId,
        before: params.before,
        after: params.after,
        payload: params.reason ? { reason: params.reason } : undefined
    });
}

export async function logClaim(params: BaseLog & ClaimPayload) {
    return logActivity({
        type: "claim",
        gameId: params.gameId,
        playerId: params.playerId,
        before: params.before,
        after: params.after,
        payload: { milestone: params.milestone, rewardId: params.rewardId, claimedId: params.claimedId }
    });
}

/**
 * cách dùng nhanh 
 * // spin
await logSpin({
  gameId: "wheel",
  playerId: "u_123",
  pieceId: 7,
  pieceReward: 8,
  before: { score: 10, spinLeft: 2 },
  after:  { score: 18, spinLeft: 1 },
});

// reset
await logReset({
  gameId: "wheel",
  playerId: "u_123",
  reason: "admin",
  before: { score: 18, spinLeft: 0 },
  after:  { score: 0,  spinLeft: 3 },
});

// claim
await logClaim({
  gameId: "wheel",
  playerId: "u_123",
  milestone: 24,
  rewardId: "voucher_24",
  before: { score: 26, spinLeft: 1 },
  after:  { score: 2,  spinLeft: 1 },
});

 */
