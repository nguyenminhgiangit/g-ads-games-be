import { Document, Model, Schema } from 'mongoose';
import { getUserConn } from '../databases/mongodb.database';

export interface ICounter extends Document {
    key: string;
    value: number;
}

const CounterSchema = new Schema<ICounter>({
    key: { type: String, unique: true, required: true },
    value: { type: Number, default: 0 },
}, { timestamps: true });

export function getCounterModel(): Model<ICounter> {
    const conn = getUserConn();
    return conn.model<ICounter>('GuestCounter', CounterSchema);
}
