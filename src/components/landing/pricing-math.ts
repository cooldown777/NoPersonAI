export function computeYearlyPrice(monthly: number, discountPct = 15): number {
  const yearly = monthly * 12 * (1 - discountPct / 100);
  return Math.round(yearly);
}

export function formatMonthlyEquivalent(yearlyTotal: number): string {
  const perMonth = yearlyTotal / 12;
  return `€${perMonth.toFixed(2)}`;
}
