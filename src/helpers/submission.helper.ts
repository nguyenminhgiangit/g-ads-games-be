import { GameMilestone } from "../services/game.service";

export function getTodayRangeVN() {
    const now = new Date();

    // Lấy thời gian hiện tại theo UTC+7
    const vnOffsetMinutes = 7 * 60;
    const local = new Date(now.getTime() + vnOffsetMinutes * 60_000);

    // Xác định ngày đầu & cuối (theo VN local)
    const startLocal = new Date(local.getFullYear(), local.getMonth(), local.getDate(), 0, 0, 0, 0);
    const endLocal = new Date(local.getFullYear(), local.getMonth(), local.getDate() + 1, 0, 0, 0, 0);

    // Quy đổi về UTC để lưu/truy vấn trong DB
    const startUtc = new Date(startLocal.getTime() - vnOffsetMinutes * 60_000);
    const endUtc = new Date(endLocal.getTime() - vnOffsetMinutes * 60_000);

    return { start: startUtc, end: endUtc };
}

export function getClaimingPoint(score: number, claimMilestones: GameMilestone[]): number | null {
    let available = null;
    const _claims = claimMilestones;
    for (const _claim of _claims) {
        if (score >= _claim.reward) {
            available = _claim.reward;
        }
    }
    return available;
}