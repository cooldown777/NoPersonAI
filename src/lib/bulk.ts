export const ALLOWED_COUNTS = [3, 5, 7, 10] as const;
export type BulkCount = (typeof ALLOWED_COUNTS)[number];

const ANGLES = [
  "hook_story",
  "contrarian",
  "personal",
  "list",
  "lesson",
] as const;
export type Angle = (typeof ANGLES)[number];

export function pickAngles(n: number): Angle[] {
  const pool = [...ANGLES].sort(() => Math.random() - 0.5);
  const result: Angle[] = [];
  let i = 0;
  while (result.length < n) {
    result.push(pool[i % pool.length]);
    i++;
  }
  return result;
}

export function clampCount(raw: number): BulkCount {
  for (let i = ALLOWED_COUNTS.length - 1; i >= 0; i--) {
    if (raw >= ALLOWED_COUNTS[i]) return ALLOWED_COUNTS[i];
  }
  return ALLOWED_COUNTS[0];
}

export function canAfford(ctx: {
  plan: "free" | "pro";
  used: number;
  requested: number;
  limit: number;
}): boolean {
  if (ctx.plan === "pro") return true;
  return ctx.used + ctx.requested <= ctx.limit;
}
