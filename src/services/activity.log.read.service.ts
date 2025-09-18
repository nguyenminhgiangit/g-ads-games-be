import { FilterQuery } from "mongoose";
import { IActivityLog } from "../models/activity.log.model";
import { Models } from "../models/model.registry";
import { ListPlayerActionsOpts, PagedResult } from "../types/activity.log.type";
import { toSafe } from "../helpers/type.helper";
import { clampInt } from "../helpers/activity.logger.helper";

/**
 * 
 // Tất cả actions của player, mọi game, trang 1, 20 items
await listPlayerActions("player_123");

// Chỉ wheel + action "spin", trang 2, 50 items/trang
await listPlayerActions("player_123", {
  gameId: "wheel",
  type: "spin",
  page: 2,
  pageSize: 50,
});
 */
export async function listPlayerActions(
    playerId: string,
    opts: ListPlayerActionsOpts = {}
): Promise<PagedResult<IActivityLog>> {
    const _pageSize = Number(toSafe(opts.pageSize) ?? 20);
    const pageSize = clampInt(_pageSize ?? 20, 1, 200);
    const _page = Number(toSafe(opts.page) ?? 1);
    const page = Math.max(1, Math.floor(_page ?? 1));

    const match: FilterQuery<IActivityLog> = { playerId };
    if (opts.gameId && opts.gameId !== "all") match.gameId = opts.gameId;
    if (opts.type && opts.type !== "all") match.type = opts.type;

    const ActivityLog = Models.ActivityLog;
    const projection = { _id: 0, playerId: 0 }; // ẩn _id, playerId cấp document
    const [total, activities] = await Promise.all([
        ActivityLog.countDocuments(match).exec(),
        ActivityLog.find(match, projection)
            .sort({ createdAt: -1, _id: -1 })           // mới → cũ, tie-break bằng _id
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean()                                     // trả plain object nhanh hơn
            .exec(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
        activities,
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

