import { Models } from "../models/model.registry";
import { GameMeta } from "../types/game.type";
import { validateConfig } from "./game.config.validate.service";
import { GameService } from "./game.service";

export const AdminService = {
    updateUser: async (
        userId: string,
        displayName: string,
        gender: string,
        birthday: Date,
        isBanned: boolean
    ) => {
        if (!userId) throw new Error("User not found");
        const updated = await Models.User.findByIdAndUpdate(
            userId,
            { displayName, gender, isBanned, birthday },
            { runValidators: true, new: true }
        ).lean();

        if (!updated) throw new Error("User not found.");

        return {
            id: updated._id,
            displayName: updated.displayName,
            gender: updated.gender,
            birthday: updated.birthday,
            isBanned: updated.isBanned,
        };
    },
    async getGameConfig(): Promise<GameMeta> {
        return await GameService.currentGame();
    },
    async updateGameConfig(payload: any) {
        validateConfig(payload);
        return await GameService.updateCurrentConfigs(payload as GameMeta);

    },
};