import { describe, expect, it } from "vitest";
import { estimateWeightKg } from "@/lib/paedsWeight";

describe("estimateWeightKg (CPG paediatric weight from age)", () => {
  it("returns null when no age is set", () => {
    expect(estimateWeightKg(0, 0)).toBeNull();
  });

  it("uses (months × 0.5) + 4 under 1 year", () => {
    expect(estimateWeightKg(0, 1)).toBe(4.5);
    expect(estimateWeightKg(0, 6)).toBe(7);
    expect(estimateWeightKg(0, 11)).toBe(9.5);
  });

  it("uses (age × 2) + 8 for 1–5 years and ignores months", () => {
    expect(estimateWeightKg(1, 0)).toBe(10);
    expect(estimateWeightKg(1, 6)).toBe(10);
    expect(estimateWeightKg(5, 0)).toBe(18);
  });

  it("uses (age × 3) + 7 for 6–14 years", () => {
    expect(estimateWeightKg(6, 0)).toBe(25);
    expect(estimateWeightKg(10, 0)).toBe(37);
    expect(estimateWeightKg(14, 0)).toBe(49);
  });

  it("returns null outside 0–14 years", () => {
    expect(estimateWeightKg(15, 0)).toBeNull();
  });
});
