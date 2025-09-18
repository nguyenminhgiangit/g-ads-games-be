import { WheelService } from "./game.wheel.service";
import { SlotService } from "./game.slot.service";
import { GameIdType, GameMeta, GameMilestone, GameProvider } from "../types/game.type";

const REGISTRY: Record<GameIdType, GameProvider> = {
  wheel: WheelService,
  slot: SlotService,
};

export const GameService = {
  /** Danh sách game được hỗ trợ */
  getSupportedGameIds(): GameIdType[] {
    return Object.keys(REGISTRY) as GameIdType[];
  },

  getMaxSpins(gameId: GameIdType): number {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return p.getMaxSpins();
  },

  getClaimMilestones(gameId: GameIdType): GameMilestone[] {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return p.getClaimMilestones();
  },

  /** Lấy meta tĩnh theo gameId (không chứa thông tin user) */
  getMeta(gameId: GameIdType): GameMeta {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return p.getMeta();
  },

  async initConfigs(gameId: GameIdType): Promise<GameMeta> {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return await p.initConfigs();
  },
  async updateConfigs(gameId: GameIdType, config: any): Promise<any> {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return await p.updateConfigs(config);
  },

  /**
   * (Tuỳ chọn) Xác định "game hiện tại" nếu bạn có rule bên ngoài:
   * - Ví dụ: đọc từ feature flag, cấu hình hệ thống, A/B, v.v.
   * - Ở đây mặc định trả "wheel".
   */
  resolveCurrentGameId(): GameIdType {
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
    const gameId = config?.id as GameIdType;
    return await this.updateConfigs(gameId, config);
  }
};
