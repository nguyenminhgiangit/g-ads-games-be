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

const DEFAULT_MAX_SPINS = 2;

/**
 * (Hiện hard-code) Có thể thay bằng DB: Models.SlotConfig.findOne({ active: true })
 */
function loadSlotConfig(): { reels: string[][]; paylines?: number[][]; symbolsMeta?: SlotMeta["symbolsMeta"] } {
    const reels = [
        ["A", "B", "C", "D"],
        ["B", "C", "D", "A"],
        ["C", "D", "A", "B"],
    ];
    const paylines = [
        [0, 0, 0],
        [1, 1, 1],
        [2, 2, 2],
    ];
    const symbolsMeta = {
        A: { payout: 5 },
        B: { payout: 10 },
        C: { payout: 20 },
        D: { payout: 50 },
    };
    return { reels, paylines, symbolsMeta };
}

export const SlotService = {
    id: "slot" as const,

    /** Số lượt tối đa mặc định của slot (không theo user) */
    getDefaultMaxSpins(): number {
        return DEFAULT_MAX_SPINS;
    },

    getClaimMilestones(): SlotMilestone[] {
        return [];
    },

    /** Meta tĩnh của slot để client render */
    getMeta(): SlotMeta {
        const cfg = loadSlotConfig();
        return {
            id: "slot",
            reels: cfg.reels,
            paylines: cfg.paylines,
            symbolsMeta: cfg.symbolsMeta,
        };
    },
};
