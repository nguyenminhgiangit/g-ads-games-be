import { Document, Model, Schema } from 'mongoose';
import { getUserConn } from '../databases/mongodb.database';
import { GENDER_ENUM, GenderType, ROLE_ENUM, RoleType } from '../types/user.type';

export interface IUser extends Document {
  guestId: string; //browserId
  email: string;
  passwordHash: string;
  createdAt: Date;
  displayName: string;
  avatarUrl: string;
  birthday: Date;
  gender: GenderType;
  isBanned: boolean;
  role: RoleType;
}

const UserSchema = new Schema<IUser>({
  guestId: { type: String, required: false },
  email: { type: String, required: false },
  passwordHash: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  displayName: { type: String, required: false },
  avatarUrl: { type: String, required: false },
  birthday: { type: Date, required: false },
  gender: { type: String, enum: GENDER_ENUM },
  isBanned: { type: Boolean, default: false },
  role: { type: String, enum: ROLE_ENUM, default: 'user' },
}, { timestamps: true });

export function getUserModel(): Model<IUser> {
  const conn = getUserConn();
  return conn.model<IUser>('User', UserSchema);
}