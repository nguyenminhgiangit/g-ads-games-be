import { Schema, Types, Document, Model } from "mongoose";
import { getGameConn } from "../databases/mongodb.database";

export interface ISubmission extends Document {
    userId: Types.ObjectId;
    username: string;
    email?: string;
    phone?: string;
    claimedPoint: number;
    currentPoint: number;
    claimedAt: Date;
    ip?: string;
    userAgent?: string;
    gameId: string,
}

const SubmissionSchema = new Schema<ISubmission>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        username: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            validate: {
                validator: (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                message: "Email không hợp lệ",
            },
        },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: (v: string) => !v || /^\+?[1-9]\d{7,14}$/.test(v),
                message: "Số điện thoại không hợp lệ",
            },
        },
        claimedPoint: { type: Number, required: true, min: 0 },
        currentPoint: { type: Number, required: true, min: 0 },
        claimedAt: { type: Date, default: Date.now, index: true },
        gameId: { type: String, required: true, index: true },
        ip: String,
        userAgent: String
    }
    // {
    //     timestamps: true, // createdAt, updatedAt
    //     versionKey: false,
    // }
);
export function getSubmissionModel(): Model<ISubmission> {
    const conn = getGameConn();
    return conn.model<ISubmission>('Submission', SubmissionSchema);
}