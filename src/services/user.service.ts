import { Models } from "../models/model.registry";
import { IUser } from "../models/user.model";
import { GameUser } from "../types/user.type";

export const UserService = {
    getProfile: async (userId: string) => {
        if (!userId) throw new Error("User not found");
        const user = await Models.User.find({ _id: userId }).select('-passwordHash');
        if (!user) throw new Error("User not found.");
        return user;
    },

    getPublicProfile: async (userId: string) => {
        if (!userId) throw new Error("User not found");
        const user = await Models.User.findById(userId).lean<IUser>();
        if (!user) throw new Error("User not found.");
        return {
            id: user._id,
            displayName: user.displayName,
            createdAt: user.createdAt,
            avatarUrl: user.avatarUrl,
            birthday: user.birthday,
            gender: user.gender,
        };
    },

    updateProfile: async (userId: string, displayName: string, gender: string, birthday: string) => {
        if (!userId) throw new Error("User not found");
        const updated = await Models.User.findByIdAndUpdate(
            userId,
            { displayName, gender, birthday },
            { runValidators: true, new: true }
        ).select('-passwordHash');
        return updated;
    },

    getGameProfile: async (userId: string): Promise<GameUser> => {
        if (!userId) throw new Error("User not found");
        const user = await Models.User.findById(userId).lean<IUser>();
        if (!user) throw new Error("User not found.");
        const resp: GameUser = {
            id: userId,
            displayName: user.displayName,
        }
        return resp;
    },
};