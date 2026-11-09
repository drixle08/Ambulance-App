// Paediatric weight-from-age estimate (CPG), shared by the paeds arrest tool
// and the drug calculator's paediatric modes so both always agree.
//
//   0–12 months : (months × 0.5) + 4
//   1–5 years   : (age × 2) + 8
//   6–14 years  : (age × 3) + 7
//
// Months are only used under 1 year. Returns null when no age is set (0 y 0 m)
// or the age is outside 0–14 years.

export const PAEDS_WEIGHT_FORMULA = "0–12 m: (months × 0.5) + 4 · 1–5 y: (age × 2) + 8 · 6–14 y: (age × 3) + 7";

export function estimateWeightKg(ageYears: number, ageMonths: number): number | null {
  const totalMonths = ageYears * 12 + ageMonths;
  if (totalMonths <= 0) return null;
  if (ageYears === 0) return totalMonths * 0.5 + 4;
  if (ageYears >= 1 && ageYears <= 5) return ageYears * 2 + 8;
  if (ageYears >= 6 && ageYears <= 14) return ageYears * 3 + 7;
  return null;
}
