import { Types } from "mongoose";
import { Models } from "../models/model.registry";
import { getTodayRangeVN } from "../helpers/submission.helper";

export const SubmissionService = {
    async add(
        gameId: string,
        userId: string,
        username: string,
        email: string | undefined,
        phone: number | string | undefined,
        claimedPoint: number,
        currentPoint: number,
        ip?: string,
        userAgent?: string
    ) {
        if (!userId) throw new Error("userId is required");
        if (!username) throw new Error("username is required");
        if (claimedPoint == null || Number.isNaN(claimedPoint) || claimedPoint == 0) {
            throw new Error("claimed point is required");
        }

        const { start, end } = getTodayRangeVN();

        // Kiểm tra trùng trong cùng ngày (UTC)
        const exists = await Models.Submission.findOne({
            userId: new Types.ObjectId(userId),
            claimedPoint,
            claimedAt: { $gte: start, $lt: end },
        }).lean();

        if (exists) {
            throw new Error("Bạn đã claim mức điểm này trong hôm nay.");
        }

        // Chuẩn hóa dữ liệu
        const normalizedEmail = email ? String(email).trim().toLowerCase() : undefined;
        const phoneStr = typeof phone === "number" ? String(phone) : phone?.toString();

        const created = await Models.Submission.create({
            gameId,
            userId: new Types.ObjectId(userId),
            username: username.trim(),
            email: normalizedEmail,
            phone: phoneStr,
            claimedPoint: Number(claimedPoint),
            currentPoint: Number(currentPoint),
            ip,
            userAgent
        });
        return created.toObject();
    },
}