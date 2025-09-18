import { WheelService } from "./game.wheel.service";
import { SlotService } from "./game.slot.service";
import { GameId, GameMeta, GameMilestone, GameProvider } from "../types/game.type";

const REGISTRY: Record<GameId, GameProvider> = {
  wheel: WheelService,
  slot: SlotService,
};

export const GameService = {
  /** Danh sách game được hỗ trợ */
  getSupportedGameIds(): GameId[] {
    return Object.keys(REGISTRY) as GameId[];
  },

  getMaxSpins(gameId: GameId): number {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return p.getMaxSpins();
  },

  getClaimMilestones(gameId: GameId): GameMilestone[] {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return p.getClaimMilestones();
  },

  /** Lấy meta tĩnh theo gameId (không chứa thông tin user) */
  getMeta(gameId: GameId): GameMeta {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return p.getMeta();
  },

  async initConfigs(gameId: GameId): Promise<GameMeta> {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return await p.initConfigs();
  },
  async updateConfigs(gameId: GameId, config: any): Promise<any> {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return await p.updateConfigs(config);
  },

  /**
   * (Tuỳ chọn) Xác định "game hiện tại" nếu bạn có rule bên ngoài:
   * - Ví dụ: đọc từ feature flag, cấu hình hệ thống, A/B, v.v.
   * - Ở đây mặc định trả "wheel".
   */
  resolveCurrentGameId(): GameId {
    return "wheel";
  },

  /** Meta của game hiện tại (không liên quan user) */
  async currentGame(): Promise<GameMeta> {
    const id = this.resolveCurrentGameId();
    return this.getMeta(id);
  },

  async initCurrentConfigs() {
    const id = this.resolveCurrentGameId();
    return this.initConfigs(id);
  },
  async updateCurrentConfigs(config: any) {
    const gameId = config?.id as GameId;
    return await this.updateConfigs(gameId, config);
  }
};
