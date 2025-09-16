import { Schema, model, Document } from 'mongoose';

export type ActivityType = 'spin' | 'reset' | 'claim';

export interface IActivityLog extends Document {
    playerId: string;         // ai thực hiện
    type: ActivityType;       // spin | reset | claim
    createdAt: Date;          // khi nào

    // Trạng thái trước/sau (nếu có)
    before?: { score?: number; spinsLeft?: number };
    after?: { score?: number; spinsLeft?: number };

    // Payload tùy theo type
    payload?: {
        // spin
        pieceId?: number;       // id lát được chọn
        value?: number | string;// giá trị hiển thị
        points?: number;        // điểm thưởng từ spin

        // reset
        reason?: string;        // lý do reset (user/manual/admin/timeout...)
        newSpins?: number;      // spins được set lại

        // claim
        milestone?: number;     // mốc đã claim (12/24/36)
        rewardId?: string;      // id phần thưởng (nếu có)
    };

    // Thông tin audit tham chiếu (optional)
    windowId?: string;        // ví dụ YYYY-MM-DD (quota window)
    layoutVersion?: string;   // version layout
    ratesSnapshot?: Array<{ piece_id: number; rate: number }>;
    requestId?: string;       // để chống retry đúp / liên kết log
    ip?: string;
    ua?: string;
}

const ActivityLogSchema = new Schema<IActivityLog>({
    playerId: { type: String, index: true, required: true },
    type: { type: String, enum: ['spin', 'reset', 'claim'], required: true },
    createdAt: { type: Date, default: () => new Date(), index: true },

    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    payload: { type: Schema.Types.Mixed },

    windowId: { type: String },
    layoutVersion: { type: String },
    ratesSnapshot: [{ piece_id: Number, rate: Number }],
    requestId: { type: String, index: true },
    ip: { type: String },
    ua: { type: String },
});

// Phân trang nhanh theo player/time
ActivityLogSchema.index({ playerId: 1, createdAt: -1 });

// export default model<IActivityLog>('ActivityLog', ActivityLogSchema);
