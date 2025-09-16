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

  getDefaultMaxSpins(gameId: GameId): number {
    const p = REGISTRY[gameId];
    if (!p) throw new Error(`Game '${gameId}' is not supported`);
    return p.getDefaultMaxSpins();
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

  //   async spin() {
  //     const id = this.resolveCurrentGameId();
  //     const meta = this.getMeta(id);
  //     const pieces = meta.
  //   }
};
