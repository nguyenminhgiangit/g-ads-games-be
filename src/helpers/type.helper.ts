export function toSafe(v: unknown) {
    if (v == 'NaN') return undefined;
    return v;
}