import { getClaimingPoint } from "../helpers/submission.helper";
import { GameMilestone, GameService } from "../services/game.service";
import { pickPiece } from "../services/game.wheel.service";
import { submitClaimingInfo } from "../services/google.script.api.service";
import { SubmissionService } from "../services/submission.service";
import { AccessTokenPayload } from "../services/token.service";
import { UserStateService } from "../services/user.state.service";

class GameController {
    async spin(req: any, res: any, next: any) {
        try {
            const { userId }: AccessTokenPayload = req.user;
            const gameMeta = await GameService.currentGame();
            const gameId = gameMeta.id;
            const _state = await UserStateService.getGState(userId, gameId);
            if (_state.spinLeft <= 0) {
                return res.status(400).json({ error: "Out of turn" });
            }

            const _pieces = gameMeta.pieces;
            const pickedPiece = await pickPiece(_pieces);
            const key = pickedPiece.key;
            const reward = pickedPiece.reward;

            const newScore = _state.score + reward;
            const newSpinLeft = _state.spinLeft - 1;
            const state = await UserStateService.updateSpinAndScore(userId, gameId, newSpinLeft, newScore);
            res.send({ key, state });
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }
    async reset(req: any, res: any, next: any) {
        try {
            const { userId }: AccessTokenPayload = req.user;
            const game = await GameService.currentGame();
            const gameId = game.id;
            const state = await UserStateService.resetSpins(userId, gameId);
            res.send({ state });
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }
    async submitInfo(req: any, res: any, next: any) {
        try {
            const { userId }: AccessTokenPayload = req.user;
            const { username, email, phone, claimedPoint } = req.body;
            if (claimedPoint == 0) {
                return res.status(400).json({ error: "You are not enough score to claim now" });
            }


            const ip = req.ip;
            const userAgent = req.get('User-Agent');

            //check 
            const gameMeta = await GameService.currentGame();
            const gameId = gameMeta.id;
            const claimMiletones: GameMilestone[] = gameMeta.claims;
            const userState = await UserStateService.getGState(userId, gameId);
            const currentPoint = userState.score;
            const claimingPoint = getClaimingPoint(currentPoint, claimMiletones);

            //kiểm tra claimedPoit client gửi lên có đúng với server không, 
            // trường hợp 0 đã loại ở phía trên
            if (claimedPoint != claimingPoint) {
                return res.status(400).json({ error: "Claiming info is wrong." });
            }

            // save submit 
            const submission = await SubmissionService.add(
                gameId,
                userId,
                username,
                email,
                phone,
                claimedPoint,
                currentPoint,
                ip,
                userAgent
            );

            //send gg sheet
            submitClaimingInfo(
                submission._id.toString(),
                username,
                email,
                phone
            );

            //reset
            const state = await UserStateService.resetSpins(userId, gameId);
            const message = 'Your information has been sent successfully.';
            res.send({ message, state });
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }
}
export const gameController = new GameController();