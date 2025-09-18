import { SlotMeta, SlotMilestone } from "./slot.type";
import { WheelMeta, WheelMilestone } from "./wheel.type";


export const GAME_ID_ENUM = ['wheel', 'slot'] as const;
export type GameIdType = (typeof GAME_ID_ENUM)[number];

export type GameState = {
    spinLeft: number;
    score: number;
};

export type GameMeta = WheelMeta | SlotMeta;
// export type GameConfig = WheelMeta | SlotMeta;

export type GameMilestone = WheelMilestone | SlotMilestone;

export type GameProvider = {
    id: GameIdType;
    getMaxSpins: () => number;
    getClaimMilestones: () => GameMilestone[];
    getMeta: () => GameMeta;
    initConfigs: () => Promise<GameMeta>;
    updateConfigs: (payload: any) => Promise<any>;
};