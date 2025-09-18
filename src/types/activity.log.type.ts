import { GameIdType } from "./game.type";

export const ACTIVITY_TYPE_ENUM = ['spin', 'reset', 'claim'] as const;
export type ActivityType = (typeof ACTIVITY_TYPE_ENUM)[number];

export type ListPlayerActionsOpts = {
    gameId?: GameIdType | "all";
    type?: ActivityType | "all";
    page?: number;      // 1-based
    pageSize?: number;  // mặc định 20, tối đa 200
};

export type PagedResult<T> = {
    activities: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

export type State = { score?: number; spinLeft?: number };

// ----- payload theo type -----
export type SpinPayload = { pieceId: string; pieceReward: number };
export type ResetPayload = { reason?: string };
export type ClaimPayload = { milestone: number; rewardId?: string; claimedId?: string };

// ----- tham số log tổng -----
export type BaseLog = {
    gameId: GameIdType;
    playerId: string;
    before?: State;
    after?: State;
    createdAt?: Date;
};

export type LogSpin = BaseLog & { type: "spin"; payload: SpinPayload };
export type LogReset = BaseLog & { type: "reset"; payload?: ResetPayload };
export type LogClaim = BaseLog & { type: "claim"; payload: ClaimPayload };
export type LogParams = LogSpin | LogReset | LogClaim;