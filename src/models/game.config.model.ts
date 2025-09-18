import { Schema, Document, Model } from "mongoose";
import { WheelMilestone, WheelPiece } from "../types/wheel.type";
import { getGameConfigConn } from "../databases/mongodb.database";
import { GAME_ID_ENUM, GameIdType } from "../types/game.type";

// Sub-schemas
const WheelPieceSchema = new Schema<WheelPiece>(
    { key: String, label: String, reward: Number, weight: Number, color: String },
    { _id: false, id: false } // 👈 không tạo _id & virtual id
);
const ClaimSchema = new Schema(
    { label: String, reward: Number },
    { _id: false, id: false }
);

// Parent schema
export interface IGameConfig extends Document {
    gameId: GameIdType;
    version: string;                               // unique
    status: "draft" | "published" | "archived";
    pieces?: WheelPiece[];
    claims?: WheelMilestone[];
    maxSpin?: number;
    effectiveAt?: Date | null;                     // lịch áp dụng
    createdBy: string;
    publishedAt?: Date | null;
}

const GameConfigSchema = new Schema<IGameConfig>(
    {
        gameId: { type: String, enum: GAME_ID_ENUM, required: true },
        version: { type: String, required: true, unique: true, index: true },
        status: { type: String, enum: ["draft", "published", "archived"], required: true, index: true },
        pieces: { type: [WheelPieceSchema], default: [] },
        claims: { type: [ClaimSchema], default: [] },
        maxSpin: { type: Number, required: true, min: 1 },
        effectiveAt: Date,
        createdBy: { type: String, required: true },
        publishedAt: Date,
    },
    { timestamps: true, versionKey: null }         // v8: dùng null thay vì false
);

export function getGameConfigModel(): Model<IGameConfig> {
    const conn = getGameConfigConn();
    return conn.model<IGameConfig>('GameConfig', GameConfigSchema);
}
