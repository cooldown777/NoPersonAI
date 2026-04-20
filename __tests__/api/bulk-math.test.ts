import { describe, it, expect } from "vitest";
import { pickAngles, clampCount, canAfford } from "@/lib/bulk";

describe("bulk-math", () => {
  it("picks N distinct angles when N ≤ 5", () => {
    const angles = pickAngles(3);
    expect(angles.length).toBe(3);
    expect(new Set(angles).size).toBe(3);
  });

  it("repeats angles when N > 5", () => {
    const angles = pickAngles(7);
    expect(angles.length).toBe(7);
    expect(new Set(angles).size).toBeLessThanOrEqual(5);
  });

  it("clamps count to allowed values", () => {
    expect(clampCount(0)).toBe(3);
    expect(clampCount(4)).toBe(3);
    expect(clampCount(5)).toBe(5);
    expect(clampCount(100)).toBe(10);
  });

  it("canAfford enforces the free quota", () => {
    expect(canAfford({ plan: "pro", used: 0, requested: 10, limit: 5 })).toBe(true);
    expect(canAfford({ plan: "free", used: 0, requested: 5, limit: 5 })).toBe(true);
    expect(canAfford({ plan: "free", used: 3, requested: 5, limit: 5 })).toBe(false);
    expect(canAfford({ plan: "free", used: 2, requested: 3, limit: 5 })).toBe(true);
  });
});
