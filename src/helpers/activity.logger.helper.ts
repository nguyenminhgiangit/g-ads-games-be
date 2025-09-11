import { Request } from 'express';
import ActivityLogSchema, { ActivityType, IActivityLog } from '../models/activity.log.model';

export async function logActivity(params: {
  req?: Request;                 // để lấy ip/ua
  playerId: string;
  type: ActivityType;
  before?: { score?: number; spinsLeft?: number };
  after?: { score?: number; spinsLeft?: number };
  payload?: IActivityLog['payload'];
  windowId?: string;
  layoutVersion?: string;
  ratesSnapshot?: Array<{ piece_id: number; rate: number }>;
  requestId?: string;
}) {
  // const { req, ...rest } = params;
  // return ActivityLogSchema.create({
  //   ...rest,
  //   ip: req?.ip,
  //   ua: req?.headers['user-agent'],
  // });
}
