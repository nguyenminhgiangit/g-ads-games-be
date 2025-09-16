import { WheelMilestone, WheelPiece } from "../types/wheel.type";

export const DEFAULT_MAX_SPINS = 3;

export const DEFAULT_PIECES: WheelPiece[] = [
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

export const DEFAULT_CLAIMINGS: WheelMilestone[] = [
    { label: "📱", reward: 12 },
    { label: "🛵", reward: 24 },
    { label: "🚗", reward: 36 }
];