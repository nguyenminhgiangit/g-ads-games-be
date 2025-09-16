// models/wheel-config.model.ts
import { Schema, Document, Model } from "mongoose";
import { WheelMilestone, WheelPiece } from "../types/wheel.type";
import { getGameConfigConn } from "../databases/mongodb.database";
import { GameId } from "../types/game.type";

export interface IGameConfig extends Document {
    gameId: GameId;
    version: string;                               // unique
    status: "draft" | "published" | "archived";
    pieces?: WheelPiece[];
    claims?: WheelMilestone[];
    maxSpin?: number;
    order?: number[];
    effectiveAt?: Date | null;                     // lịch áp dụng
    createdBy: string;
    publishedAt?: Date | null;
}

const GameConfigSchema = new Schema<IGameConfig>(
    {
        gameId: { type: String, enum: ['wheel', 'slot'], required: true },
        version: { type: String, required: true, unique: true, index: true },
        status: { type: String, enum: ["draft", "published", "archived"], required: true, index: true },
        pieces: [{ key: String, label: String, reward: Number, weight: Number, color: String }],
        claims: [{ label: String, reward: Number }],
        maxSpin: { type: Number, required: true, min: 1 },
        order: [Number],
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
