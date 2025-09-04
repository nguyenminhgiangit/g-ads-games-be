import { SpinService } from "../services/spin.service";

class SpinController {
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

        const pieces = Array.from({ length: 12 }, (_, i) => ({
            piece_id: i + 1,
            value: i,
        }));
        const result = SpinService.pickPiece(rates, pieces);
        res.send({
            code: 200,
            msg: 'success',
            result
        });
    }
}
export const spinController = new SpinController();