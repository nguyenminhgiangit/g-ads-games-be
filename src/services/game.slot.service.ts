import { Models } from "../models/model.registry";
import { SlotMeta, SlotMilestone } from "../types/slot.type";


const DEFAULT_MAX_SPINS = 2;

/**
 * (Hiện hard-code) Có thể thay bằng DB: Models.SlotConfig.findOne({ active: true })
 */
function loadSlotConfig(): { reels: string[][]; paylines?: number[][]; symbolsMeta?: SlotMeta["symbolsMeta"] } {
    const reels = [
        ["A", "B", "C", "D"],
        ["B", "C", "D", "A"],
        ["C", "D", "A", "B"],
    ];
    const paylines = [
        [0, 0, 0],
        [1, 1, 1],
        [2, 2, 2],
    ];
    const symbolsMeta = {
        A: { payout: 5 },
        B: { payout: 10 },
        C: { payout: 20 },
        D: { payout: 50 },
    };
    return { reels, paylines, symbolsMeta };
}

export const SlotService = {
    id: "slot" as const,

    /** Số lượt tối đa mặc định của slot (không theo user) */
    getMaxSpins(): number {
        return DEFAULT_MAX_SPINS;
    },

    getClaimMilestones(): SlotMilestone[] {
        return [];
    },

    /** Meta tĩnh của slot để client render */
    getMeta(): SlotMeta {
        const cfg = loadSlotConfig();
        return {
            id: "slot",
            reels: cfg.reels,
            paylines: cfg.paylines,
            symbolsMeta: cfg.symbolsMeta,
        };
    },
    async initConfigs(): Promise<SlotMeta> {
        try {
            const gameId = 'wheel';
            let configs = await Models.GameConfig.findOne({ gameId });
            if (configs) {
                console.log(` ✅ ${gameId}'s config is ready.. `);
            }
            else {
                configs = await Models.GameConfig.create({
                    status: "published",

                    effectiveAt: null,                // áp dụng ngay
                    createdBy: "system",
                    publishedAt: new Date(),
                });
                console.log(` ✅ ${gameId}'s config is created new.. `);
            }

            return this.getMeta();
        }
        catch (err) {
            console.log('initConfigs err: ', err);
            return null;
        }
    },
    async updateConfigs(payload: SlotMeta): Promise<any> {
        try {
            return {
                ok: true,
                message: 'Updating config is success.'
            };
        }
        catch (err: any) {
            console.log('Updating config failed err: ', err);
            return { ok: false, error: err.message ?? 'Updating config failed.' };
        }
    }
};
