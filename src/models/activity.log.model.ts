import { Schema, Document, Model } from 'mongoose';
import { getGameConfigConn } from '../databases/mongodb.database';
import { GAME_ID_ENUM, GameIdType } from '../types/game.type';
import { ACTIVITY_TYPE_ENUM, ActivityType } from '../types/activity.log.type';


export type State = { score?: number; spinLeft?: number };

export interface IActivityLog extends Document {
    gameId: GameIdType;
    playerId: string;
    type: ActivityType;              // 'spin' | 'reset' | 'claim'
    createdAt: Date;

    before?: { score?: number; spinLeft?: number };
    after?: { score?: number; spinLeft?: number };

    payload?: {
        // spin
        pieceId?: string;
        pieceReward?: string;

        // reset
        reason?: string;

        // claim
        milestone?: number;            // 12 / 24 / 36
        rewardId?: string;
        claimedId?: string;
    };
}

// ---- sub-schemas (no _id) ----
const StateSchema = new Schema(
    { score: Number, spinLeft: Number },
    { _id: false, id: false }
);

const PayloadSchema = new Schema(
    {
        pieceId: String,
        pieceReward: Number,
        reason: String,
        milestone: Number,
        rewardId: String,
    },
    { _id: false, id: false }
);
// ---- main schema ----
const ActivityLogSchema = new Schema<IActivityLog>(
    {
        gameId: { type: String, enum: GAME_ID_ENUM, required: true, index: true },
        playerId: { type: String, required: true, index: true },
        type: { type: String, enum: ACTIVITY_TYPE_ENUM, required: true, index: true },
        createdAt: { type: Date, default: () => new Date(), index: true },

        before: { type: StateSchema, default: undefined },
        after: { type: StateSchema, default: undefined },
        payload: { type: PayloadSchema, default: undefined },
    },
    {
        versionKey: null,          // không lưu __v
        // timestamps: true,       // nếu muốn có updatedAt tự động thì bật
    }
);

// Indexes tối ưu truy vấn phân trang mới → cũ
ActivityLogSchema.index({ playerId: 1, createdAt: -1 });
ActivityLogSchema.index({ playerId: 1, gameId: 1, createdAt: -1 });
ActivityLogSchema.index({ playerId: 1, type: 1, createdAt: -1 });


export function getActivityLogModel(): Model<IActivityLog> {
    const conn = getGameConfigConn();
    return conn.model<IActivityLog>('ActivityLog', ActivityLogSchema);
}

