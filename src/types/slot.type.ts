export type SlotMeta = {
    id: "slot";
    reels: string[][];         // ma trận ký hiệu theo từng reel
    paylines?: number[][];     // các dòng ăn thưởng (tùy chọn)
    symbolsMeta?: Record<string, { payout?: number }>;
    claims?: SlotMilestone[],
    maxSpin?: number;
    pieces?: SlotPiece[];
};
export type SlotPiece = {
    key: string;
    label: string;
    weight?: number;
    reward?: number;
};
export type SlotMilestone = {
    label: string;
    reward: number;
};