
export type Rate = { piece_id: number; rate: number };
export type Piece = { piece_id: number; value: number };
export const SpinService = {
    pickPiece: (rates: Rate[], pieces: Piece[]): Piece => {
        const totalRate = rates.reduce((sum, r) => sum + r.rate, 0);
        let r = Math.random() * totalRate;

        for (const rate of rates) {
            r -= rate.rate;
            if (r <= 0) {
                // tìm piece tương ứng với piece_id
                const piece = pieces.find(p => p.piece_id === rate.piece_id);
                if (!piece) {
                    throw new Error(`Piece ${rate.piece_id} not found in pieces`);
                }
                return piece;
            }
            // fallback: nếu có lỗi thì trả về phần tử cuối
            return pieces[pieces.length - 1];
        }
    }
}