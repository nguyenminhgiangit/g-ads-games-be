import { Types } from "mongoose";
import { Models } from "../models/model.registry";
import { IUserState } from "../models/user.state.model";
import { GameState } from "../types/game.type";

// Mặc định số lượt cho mỗi game
const DEFAULT_MAX_SPINS: Record<IUserState["gameId"], number> = {
    wheel: 3,
    slot: 2,
};



export const UserStateService = {
    /**
     * Lấy hoặc tạo mới state cho user + game
     */
    async getState(userId: string | Types.ObjectId, gameId: IUserState["gameId"]): Promise<IUserState> {
        const UserState = Models.UserState;
        const _userId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

        let state = await UserState.findOne({ userId: _userId, gameId });
        if (!state) {
            state = await UserState.create({
                userId: _userId,
                gameId,
                spinLeft: DEFAULT_MAX_SPINS[gameId],
                score: 0,
            });
        }
        return state;
    },

    async getGState(userId: string | Types.ObjectId, gameId: IUserState["gameId"]): Promise<GameState> {
        const state = await this.getState(userId, gameId);
        const gState = {
            spinLeft: state.spinLeft,
            score: state.score
        }
        return gState;
    },

    /**
     * Đặt lại spinLeft về tối đa mặc định (ví dụ reset theo ngày)
     */
    async resetSpins(userId: string | Types.ObjectId, gameId: IUserState["gameId"]) {
        const UserState = Models.UserState;
        const _userId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

        const state = await UserState.findOneAndUpdate(
            { userId: _userId, gameId },
            { $set: { spinLeft: DEFAULT_MAX_SPINS[gameId], score: 0, updatedAt: new Date() } },
            { new: true, upsert: true }
        );
        return {
            spinLeft: state.spinLeft,
            score: state.score
        };
    },

    /**
     * Giảm/tăng spinLeft có chặn min/max theo mặc định
     */
    async addSpins(userId: string | Types.ObjectId, gameId: IUserState["gameId"], delta: number) {
        const state = await this.getState(userId, gameId);
        const max = DEFAULT_MAX_SPINS[gameId];
        const next = Math.max(0, Math.min(max, state.spinLeft + delta));
        if (next === state.spinLeft) return state;

        state.spinLeft = next;
        state.updatedAt = new Date();
        await state.save();
        return {
            spinLeft: state.spinLeft,
            score: state.score
        };
    },

    /**
     * Cập nhật điểm (cộng thêm)
     */
    async addScore(userId: string | Types.ObjectId, gameId: IUserState["gameId"], add: number) {
        const state = await this.getState(userId, gameId);
        state.score = (state.score || 0) + add;
        state.updatedAt = new Date();
        await state.save();
        return {
            spinLeft: state.spinLeft,
            score: state.score
        };
    },

    async updateSpinAndScore(userId: string | Types.ObjectId, gameId: IUserState["gameId"], spinLeft: number, score: number) {
        const state = await this.getState(userId, gameId);
        state.spinLeft = spinLeft;
        state.score = score;
        state.updatedAt = new Date();
        await state.save();
        return {
            spinLeft: state.spinLeft,
            score: state.score
        };
    },
};