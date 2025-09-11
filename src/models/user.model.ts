import { Document, Model, Schema } from 'mongoose';
import { getUserConn } from '../databases/mongodb.database';

export interface IUser extends Document {
  guestId: string; //browserId
  email: string;
  passwordHash: string;
  createdAt: Date;
  displayName: string;
  avatarUrl: string;
  birthday: Date;
  gender: 'male' | 'female' | 'other';
  isBanned: boolean;
  role: 'user' | 'admin';
}

const UserSchema = new Schema<IUser>({
  guestId: { type: String, required: false },
  email: { type: String, required: false },
  passwordHash: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  displayName: { type: String, required: false },
  avatarUrl: { type: String, required: false },
  birthday: { type: Date, required: false },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  isBanned: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

export function getUserModel(): Model<IUser> {
  const conn = getUserConn();
  return conn.model<IUser>('User', UserSchema);
}