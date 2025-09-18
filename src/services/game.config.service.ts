import { GameMeta } from "../types/game.type";
import { validateConfig } from "./game.config.validate.service";
import { GameService } from "./game.service";

export const GameConfigService = {
    async getGameConfig(): Promise<GameMeta> {
        return await GameService.currentGame();
    },
    async updateGameConfig(payload: any) {
        validateConfig(payload);
        return await GameService.updateCurrentConfigs(payload as GameMeta);
    },
};