import { IGameConfig } from "../models/game.config.model";
import { GameId } from "../types/game.type";

export function validateConfig(payload: Pick<IGameConfig, "id" | "pieces" | "claims" | "maxSpin">) {
    const { id, pieces, claims, maxSpin } = payload;
    if (!isGameId(id)) throw new Error("gameId invalid");

    if (!Array.isArray(pieces) || pieces.length != 12) {
        throw new Error("It must be 12 pieces");
    }
    for (const p of pieces) {
        if (!p.key || p.weight == null || p.weight < 0) throw new Error("piece.key and weight >= 0");
        if (p.reward == null || p.reward < 0) throw new Error("piece.reward >= 0");
    }
    const totalWeight = pieces.reduce((s, p) => s + p.weight, 0);
    if (totalWeight != 100) throw new Error("Total weight must be 100");

    if (!Array.isArray(claims) || claims.length === 0) {
        throw new Error("Claims must not empty");
    }
    for (const c of claims) {
        if (c.reward == null || c.reward <= 0) throw new Error("claim.reward > 0");
    }

    if (typeof maxSpin !== "number" || maxSpin <= 0) {
        throw new Error("maxSpin must be than 0");
    }
}

const ALLOWED_GAME_IDS: GameId[] = ["wheel", "slot"];
function isGameId(_id: GameId): _id is GameId {
    return ALLOWED_GAME_IDS.includes(_id);
}