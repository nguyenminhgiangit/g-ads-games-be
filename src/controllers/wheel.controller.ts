import { logActivity } from "../helpers/activity.logger.helper";
import { getPiece, pickPiece, pickPieceAtomic } from "../services/wheel.service_";

class WheelController {
    async spin(req: any, res: any, next: any) {
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
    }
    async layout(req: any, res: any, next: any) {
        const pieces = getPiece();
        res.send({
            code: 200,
            msg: 'success',
            layout: pieces
        });
    }
}
export const wheelController = new WheelController();