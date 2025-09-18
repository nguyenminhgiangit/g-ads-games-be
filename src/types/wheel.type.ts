import Redis, { Cluster } from "ioredis";
import { GameId } from "./game.type";

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

export type WheelMeta = {
    id: GameId;
    pieces?: WheelPiece[];   // theo THỨ TỰ hiển thị
    claims?: WheelMilestone[];
    maxSpin?: number;
};

export type WheelConfig = {
    id: GameId;
    pieces?: WheelPiece[];   // theo THỨ TỰ hiển thị
    claims?: WheelMilestone[];
    maxSpin?: number;
};

export type RedisLike = Redis | Cluster;