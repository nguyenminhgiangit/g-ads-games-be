import { getClaimingPoint } from "../helpers/submission.helper";
import { GameMilestone, GameService } from "../services/game.service";
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
            const keys = _pieces.map(x => x.key);
            const randIdx = Math.floor(Math.random() * keys.length);
            const key = keys[randIdx];
            const reward = _pieces[randIdx].reward;

            const newScore = _state.score + reward;
            const newSpinLeft = _state.spinLeft - 1;
            const state = await UserStateService.updateSpinAndScore(userId, gameId, newSpinLeft, newScore);
            res.send({ key, state });
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }

    /** 
    const rates = [
        { piece_id: 1, rate: 20 },
        { piece_id: 2, rate: 5 },
        { piece_id: 3, rate: 5 },
        { piece_id: 4, rate: 20 },
        { piece_id: 5, rate: 5 },
        { piece_id: 6, rate: 5 },
        { piece_id: 7, rate: 15 },
        { piece_id: 8, rate: 5 },
        { piece_id: 9, rate: 5 },
        { piece_id: 10, rate: 5 },
        { piece_id: 11, rate: 5 },
        { piece_id: 12, rate: 5 },
    ];

    // const result = pickPiece(rates);
    const result = await pickPieceAtomic(rates);

    await logActivity({
        req,
        playerId: 'tester',
        type: 'spin',
        // before: { score: beforeScore, spinsLeft: beforeSpins },
        // after: { score: player.score, spinsLeft: player.spinsLeft },
        payload: {
            pieceId: result.piece_id,
            value: result.value,
            // points,               // điểm cộng từ spin
        },
        // windowId,
        layoutVersion: 'v1',
        ratesSnapshot: rates,
        requestId: req.headers['x-request-id'] as string | undefined,
    });

    res.send({
        code: 200,
        msg: 'success',
        result
    });
    */
    async reset(req: any, res: any, next: any) {
        try {
            const { userId }: AccessTokenPayload = req.user;
            const game = await GameService.currentGame();
            const gameId = game.id;
            const state = await UserStateService.resetSpins(userId, gameId);
            console.log('state after:: ', state);
            res.send({ state });
        } catch (err: any) {
            res.status(404).json({ message: err.message });
        }
    }
    async submitInfo(req: any, res: any, next: any) {
        try {
            const { userId }: AccessTokenPayload = req.user;
            const { username, email, phone, claimedPoint } = req.body;
            console.log('submitInfo:: ', userId, username, email, phone, claimedPoint);
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
            await SubmissionService.add(
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