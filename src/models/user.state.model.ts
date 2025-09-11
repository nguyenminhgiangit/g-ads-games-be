import { Schema, Document, Types, Model } from 'mongoose';
import { getGameConn } from '../databases/mongodb.database';

export interface IUserState extends Document {
    gameId: 'wheel' | 'slot';
    userId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    spinLeft: number;
    score: number;

    //wheel

    //slot
}

const UserStateSchema = new Schema<IUserState>({
    gameId: { type: String, enum: ['wheel', 'slot'], required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    spinLeft: { type: Number, default: 3 },
    score: { type: Number, default: 0 },
});

export function getUserStateModel(): Model<IUserState> {
    const conn = getGameConn();
    return conn.model<IUserState>('StateGame', UserStateSchema);
}