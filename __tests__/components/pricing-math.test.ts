import { describe, it, expect } from "vitest";
import {
  computeYearlyPrice,
  formatMonthlyEquivalent,
} from "@/components/landing/pricing-math";

describe("pricing math", () => {
  it("applies 15% discount to yearly price", () => {
    expect(computeYearlyPrice(29)).toBe(296); // 29 * 12 * 0.85 = 295.80 → 296
  });

  it("formats monthly equivalent for yearly plan", () => {
    // 296 / 12 = 24.666... → "€24.67"
    expect(formatMonthlyEquivalent(296)).toBe("€24.67");
  });
});
