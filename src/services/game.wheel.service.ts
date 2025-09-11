
export type WheelPiece = {
    key: string;
    label: string;
    weight?: number;
    reward?: number;
    color?: string;
};
export type WheelMilestone = {
    label: string;
    reward: number;
};
export type GameId = 'wheel' | 'slot';
export type WheelMeta = {
    id: GameId;
    pieces?: WheelPiece[];   // theo THỨ TỰ hiển thị
    claims?: WheelMilestone[];
    maxSpin?: number;
};

const DEFAULT_MAX_SPINS = 3;
let _wheelPieces: WheelPiece[] = null;
let _claimMilestones: WheelMilestone[] = null;
let _maxSpin: number = undefined;

/**
 * (Hiện hard-code) Có thể thay bằng load từ DB: Models.WheelConfig.findOne({ active: true })
 * nếu có order[], hãy map lại để pieces theo đúng thứ tự hiển thị.
 */
function loadWheelPiecesConfig(): WheelPiece[] {
    const _pieces: WheelPiece[] = [
        { key: "p1", label: "#1", reward: 1, weight: 9 },
        { key: "p2", label: "#2", reward: 2, weight: 9 },
        { key: "p3", label: "#3", reward: 3, weight: 9 },
        { key: "p4", label: "#4", reward: 4, weight: 9 },
        { key: "p5", label: "#5", reward: 5, weight: 8 },
        { key: "p6", label: "#6", reward: 6, weight: 8 },
        { key: "p7", label: "#7", reward: 7, weight: 8 },
        { key: "p8", label: "#8", reward: 8, weight: 8 },
        { key: "p9", label: "#9", reward: 9, weight: 8 },
        { key: "p10", label: "#10", reward: 10, weight: 8 },
        { key: "p11", label: "#11", reward: 11, weight: 8 },
        { key: "p12", label: "#12", reward: 12, weight: 8 }
    ];
    const pieces = shuffle([..._pieces]);
    return pieces;
}
function loadClaimMilestonesConfig(): WheelMilestone[] {
    const claims: WheelMilestone[] = [
        { label: "📱", reward: 12 },
        { label: "🛵", reward: 24 },
        { label: "🚗", reward: 36 }
    ];
    return claims;
}
function loadMaxSpinConfig(): number {
    return DEFAULT_MAX_SPINS;
}
function shuffle<T>(array: T[]): T[] {
    let m = array.length, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        [array[m], array[i]] = [array[i], array[m]];
    }
    return array;
}

export const WheelService = {
    id: "wheel" as const,

    getDefaultMaxSpins(): number {
        if (!_maxSpin) _maxSpin = loadMaxSpinConfig();
        return _maxSpin;
    },
    getClaimMilestones(): WheelMilestone[] {
        if (!_claimMilestones) _claimMilestones = loadClaimMilestonesConfig();
        return _claimMilestones;
    },
    getMeta(): WheelMeta {
        if (!_wheelPieces) _wheelPieces = loadWheelPiecesConfig();
        if (!_claimMilestones) _claimMilestones = loadClaimMilestonesConfig();
        if (!_maxSpin) _maxSpin = loadMaxSpinConfig();

        return { id: "wheel", pieces: _wheelPieces, claims: _claimMilestones, maxSpin: _maxSpin };
    },
    getClaimMinetons(): number {
        return DEFAULT_MAX_SPINS;
    },
};
