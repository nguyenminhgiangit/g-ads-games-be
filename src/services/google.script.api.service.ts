// Node 18+ có sẵn fetch. Nếu Node <18, cài `npm i cross-fetch` và import từ 'cross-fetch'.
const API_URL =
    "https://script.google.com/macros/s/AKfycbyHdOT7JcqyQgVIGQkj8SX60U8u9XTCx0HWX7gJRXA3Whay0VNT-OLKYtSpAtDAWrJTOw/exec";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2; // tổng số nỗ lực = 1 + MAX_RETRIES

// Hàng đợi tuần tự siêu gọn (concurrency = 1)
class RequestQueue {
    private chain: Promise<void> = Promise.resolve();

    push<T>(task: () => Promise<T>): Promise<T> {
        const run = this.chain.then(task);
        // giữ chain tiếp tục dù success hay fail
        this.chain = run.then(
            (): void => { },   // <-- ghi rõ kiểu trả về void
            (): void => { }
        );
        return run;
    }
}
const queue = new RequestQueue();

type SubmitResult =
    | { ok: true; data: any }
    | { ok: false; status?: number; error: string; raw?: string };

function buildUrl(params: Record<string, string>) {
    const q = new URLSearchParams(params);
    // cache-buster để tránh bị cache ở giữa đường
    q.set("_ts", Date.now().toString());
    return `${API_URL}?${q.toString()}`;
}

async function doFetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
        return await fetch(url, { method: "GET", signal: ac.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function callAppsScript(params: {
    claimedId: string;
    username: string;
    email: string;
    phone: string;
}): Promise<SubmitResult> {
    const url = buildUrl({
        action: "submitPlayerInfo",
        claimedId: params.claimedId,
        username: params.username,
        email: params.email,
        phone: params.phone,
    });

    let lastErr: any;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await doFetchWithTimeout(url, REQUEST_TIMEOUT_MS);
            const raw = await res.text();

            // cố gắng parse JSON nếu có
            try {
                const json = JSON.parse(raw);
                if (!res.ok) return { ok: false, status: res.status, error: "HTTP error", raw };
                return { ok: true, data: json };
            } catch {
                if (!res.ok) return { ok: false, status: res.status, error: "HTTP error", raw };
                return { ok: true, data: raw }; // Apps Script có thể trả text
            }
        } catch (e: any) {
            lastErr = e?.name === "AbortError" ? "timeout" : e?.message || String(e);
            // Backoff nhẹ trước khi thử lại
            await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        }
    }
    return { ok: false, error: String(lastErr) };
}

/**
 * Gửi thông tin claim lên Google Apps Script (GET) theo thứ tự từng request.
 * Nếu có request trước đó chưa xong, request mới sẽ đợi trong hàng.
 */
export async function submitClaimingInfo(
    claimedId: string,
    username: string,
    email: string,
    phone: string
): Promise<SubmitResult> {
    // Chuẩn hóa dữ liệu nhẹ (trim)
    const payload = {
        claimedId: String(claimedId).trim(),
        username: String(username).trim(),
        email: String(email || "").trim(),
        phone: String(phone || "").trim(),
    };

    // Bỏ qua nếu thiếu claimedId/username
    if (!payload.claimedId) return { ok: false, error: "claimedId is required" };
    if (!payload.username) return { ok: false, error: "username is required" };

    // Đưa vào hàng đợi để đảm bảo tuần tự
    return queue.push(() => callAppsScript(payload));
}
