import { getClaimingPoint } from "../helpers/submission.helper";
import { getReachedMilestone } from "../helpers/wheel.helper";
import { listPlayerActions } from "../services/activity.log.read.service";
import { logClaim, logReset, logSpin } from "../services/activity.log.write.service";
import { GameService } from "../services/game.service";
import { pickPiece } from "../services/game.wheel.service";
import { submitClaimingInfo } from "../services/google.script.api.service";
import { SubmissionService } from "../services/submission.service";
import { AccessTokenPayload } from "../services/token.service";
import { UserService } from "../services/user.service";
import { UserStateService } from "../services/user.state.service";
import { GameMilestone } from "../types/game.type";

class GameController {
    async gameMe(req: any, res: any, next: any) {
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
    async spin(req: any, res: any, next: any) {
        try {
            const { userId }: AccessTokenPayload = req.user;
            const gameMeta = await GameService.currentGame();
            const gameId = gameMeta.id;
            const currentState = await UserStateService.getGState(userId, gameId);
            if (currentState.spinLeft <= 0) {
                return res.status(400).json({ error: "Out of turn" });
            }

            const _pieces = gameMeta.pieces;
            const pickedPiece = await pickPiece(_pieces);
            const key = pickedPiece.key;
            const reward = pickedPiece.reward;

            const newScore = currentState.score + reward;
            const newSpinLeft = currentState.spinLeft - 1;
            const state = await UserStateService.updateSpinAndScore(userId, gameId, newSpinLeft, newScore);

            //log
            const before = currentState;
            const after = state;
            await logSpin({
                gameId,
                playerId: userId,
                pieceId: key,
                pieceReward: reward,
                before,
                after
            });

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
            const currentState = await UserStateService.getGState(userId, gameId);
            const state = await UserStateService.resetSpins(userId, gameId);

            //log
            const before = currentState;
            const after = state;
            await logReset({
                gameId,
                playerId: userId,
                reason: "action-player",
                before,
                after,
            });

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
            const currentState = await UserStateService.getGState(userId, gameId);
            const currentPoint = currentState.score;
            const claimingPoint = getClaimingPoint(currentPoint, claimMiletones);

            //kiểm tra claimedPoit client gửi lên có đúng với server không, 
            // trường hợp 0 đã loại ở phía trên
            if (claimedPoint != claimingPoint) {
                return res.status(400).json({ error: "Claiming info is wrong." });
            }

            const claimingReward = getReachedMilestone(claimedPoint, claimMiletones)?.label ?? '🎁';

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

            const claimedId = submission._id.toString();
            //send gg sheet
            submitClaimingInfo(
                claimedId,
                username,
                email,
                phone
            );

            //reset
            const state = await UserStateService.resetSpins(userId, gameId);

            //log
            const before = currentState;
            const after = state;
            await logClaim({
                gameId,
                playerId: userId,
                milestone: claimedPoint,
                rewardId: claimingReward,
                claimedId,
                before,
                after
            });

            const message = 'Your information has been sent successfully.';
            res.send({ message, state });
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }
    async getActivities(req: any, res: any, next: any) {
        try {
            const { userId }: AccessTokenPayload = req.user;
            const { gameId, type, page, pageSize } = req.query;

            const activities = await listPlayerActions(userId, {
                gameId,
                type,
                page,
                pageSize
            });

            res.send(activities);
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }
}
export const gameController = new GameController();