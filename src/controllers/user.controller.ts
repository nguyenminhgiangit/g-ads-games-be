import { GameService } from "../services/game.service";
import { AccessTokenPayload } from "../services/token.service";
import { UserService } from "../services/user.service";
import { UserStateService } from "../services/user.state.service";

class UserController {
    async getProfile(req: any, res: any) {
        try {
            const { userId }: AccessTokenPayload = req.user;
            const result = await UserService.getProfile(userId);
            res.json(result);
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }
    async getPublicProfile(req: any, res: any) {
        try {
            const userId = req.params.id;
            const result = await UserService.getPublicProfile(userId);
            res.json(result);
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }
    async updateProfile(req: any, res: any) {
        try {
            const { userId }: AccessTokenPayload = req.user;
            const { displayName, gender, birthday } = req.body;
            const result = await UserService.updateProfile(
                userId,
                displayName,
                gender,
                birthday
            );
            res.json(result);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
    async gameForMe(req: any, res: any) {
        try {
            const { userId }: AccessTokenPayload = req.user;
            const user = await UserService.getGameProfile(userId);
            const game = await GameService.currentGame();
            const gameId = game.id ?? 'wheel';
            const state = await UserStateService.getGState(userId, gameId);
            const result = { user, game, state };
            res.json(result);
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }
}
export const userController = new UserController();