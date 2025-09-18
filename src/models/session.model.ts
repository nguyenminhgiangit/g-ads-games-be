import { Schema, Document, Types, Model } from 'mongoose';
import { getAuthConn } from '../databases/mongodb.database';
import { PLATFORM_ENUM, PlatformType } from '../types/session.type';

export interface ISession extends Document {
  userId: Types.ObjectId;
  deviceId: string;
  platform: PlatformType;
  refreshToken: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  lastActiveAt: Date;
  expiredAt: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: String, required: true },
  platform: { type: String, enum: PLATFORM_ENUM, required: true },
  refreshToken: { type: String, required: true },
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  expiredAt: { type: Date }
});

export function getSessionModel(): Model<ISession> {
  const conn = getAuthConn();
  return conn.model<ISession>('Session', SessionSchema);
}