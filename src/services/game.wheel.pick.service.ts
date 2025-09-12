// pickPieceAtomic.ioredis.ts
import type Redis from "ioredis";
import type { Cluster } from "ioredis";

type RedisLike = Redis | Cluster;

export type WheelPiece = {
    key: string;
    label: string;
    weight?: number;
    reward?: number;
    color?: string;
};

const LUA_PICK_ATOMIC = `
local windowSize  = tonumber(ARGV[1])
local ttlSeconds  = tonumber(ARGV[2])
local n           = tonumber(ARGV[3])

local pieceKeys = {}
local weights = {}
local totalWeight = 0

for i = 1, n do
  pieceKeys[i] = ARGV[3 + i]
end

for i = 1, n do
  local w = tonumber(ARGV[3 + n + i]) or 0
  if w < 0 then w = 0 end
  weights[i] = w
  totalWeight = totalWeight + w
end

if totalWeight <= 0 then
  local idx = math.random(n)
  redis.call("HINCRBY", KEYS[1], pieceKeys[idx], 1)
  local ttl = redis.call("TTL", KEYS[1])
  if ttl < 0 then redis.call("EXPIRE", KEYS[1], ttlSeconds) end
  return pieceKeys[idx]
end

local used = {}
for i = 1, n do
  local c = redis.call("HGET", KEYS[1], pieceKeys[i])
  if not c then c = "0" end
  used[i] = tonumber(c) or 0
end

local remaining = {}
local sumRemaining = 0
for i = 1, n do
  local expected = windowSize * (weights[i] / totalWeight)
  local rem = expected - used[i]
  if rem < 0 then rem = 0 end
  remaining[i] = rem
  sumRemaining = sumRemaining + rem
end

local function pickBy(arr)
  local sum = 0
  for i = 1, n do sum = sum + arr[i] end
  if sum <= 0 then
    return math.random(n)
  end
  local r = math.random() * sum
  for i = 1, n do
    r = r - arr[i]
    if r <= 0 then return i end
  end
  return n
end

local idx = nil
if sumRemaining > 0 then
  idx = pickBy(remaining)
else
  idx = pickBy(weights)
end

redis.call("HINCRBY", KEYS[1], pieceKeys[idx], 1)
local ttl = redis.call("TTL", KEYS[1])
if ttl < 0 then redis.call("EXPIRE", KEYS[1], ttlSeconds) end

return pieceKeys[idx]
`;

let cachedSha: string | null = null;
async function loadLua(redis: RedisLike): Promise<string> {
    if (cachedSha) return cachedSha;
    try {
        const res = await (redis as any).script("load", LUA_PICK_ATOMIC);
        cachedSha = typeof res === "string" ? res : String(res);
    } catch {
        cachedSha = ""; // fallback dùng EVAL
    }
    return cachedSha!;
}

function weightedPickIndex(weights: number[]): number {
    const sum = weights.reduce((a, b) => a + b, 0);
    if (sum <= 0) return Math.floor(Math.random() * weights.length);
    let r = Math.random() * sum;
    for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) return i;
    }
    return weights.length - 1;
}

/**
 * Trả về chính object `WheelPiece` đã chọn.
 */
export async function pickPieceAtomic(
    redis: RedisLike,
    redisKey: string,    // nhớ dùng hash-tag {...} nếu là Redis Cluster
    pieces: WheelPiece[],
    windowSize: number,
    ttlSeconds: number
): Promise<WheelPiece> {
    if (!Array.isArray(pieces) || pieces.length === 0) {
        throw new Error("pieces must be non-empty");
    }
    if (windowSize <= 0) throw new Error("windowSize must be > 0");
    if (ttlSeconds <= 0) throw new Error("ttlSeconds must be > 0");

    // Map key -> piece để trả về nhanh
    const key2piece = new Map(pieces.map(p => [p.key, p]));
    const keys = pieces.map(p => p.key);
    const weights = pieces.map(p => (p.weight ?? 1) < 0 ? 0 : (p.weight ?? 1));

    const sha = await loadLua(redis);
    const argv: (string | number)[] = [
        String(windowSize),
        String(ttlSeconds),
        String(keys.length),
        ...keys,
        ...weights.map(String),
    ];

    try {
        const raw = sha
            ? await (redis as any).evalsha(sha, 1, redisKey, ...argv)
            : await (redis as any).eval(LUA_PICK_ATOMIC, 1, redisKey, ...argv);

        const pickedKey = String(raw);
        const piece = key2piece.get(pickedKey);
        if (!piece) {
            // Trường hợp hiếm khi key không khớp (data thay đổi giữa lúc gọi) -> fallback an toàn
            const idx = weightedPickIndex(weights);
            return pieces[idx];
        }
        return piece;
    } catch (e) {
        // Redis lỗi -> fallback non-atomic
        console.error("pickPieceAtomic redis error -> fallback local:", e);
        const idx = weightedPickIndex(weights);
        return pieces[idx];
    }
}
