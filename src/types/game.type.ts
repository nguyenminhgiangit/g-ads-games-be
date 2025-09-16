import { SlotMeta, SlotMilestone } from "./slot.type";
import { WheelMeta, WheelMilestone } from "./wheel.type";

export type GameId = 'wheel' | 'slot';

export type GameState = {
    spinLeft: number;
    score: number;
};

export type GameMeta = WheelMeta | SlotMeta;

export type GameMilestone = WheelMilestone | SlotMilestone;

export type GameProvider = {
    id: GameId;
    getDefaultMaxSpins: () => number;
    getClaimMilestones: () => GameMilestone[];
    getMeta: () => GameMeta;
};