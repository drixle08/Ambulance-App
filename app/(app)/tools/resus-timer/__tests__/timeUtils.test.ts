import { describe, expect, it } from "vitest";
import { formatSeconds, formatTPlus } from "../timeUtils";

describe("time formatting helpers", () => {
  describe("formatSeconds", () => {
    it("pads minutes and seconds", () => {
      expect(formatSeconds(65)).toBe("01:05");
      expect(formatSeconds(600)).toBe("10:00");
    });

    it("clamps negative inputs to zero", () => {
      expect(formatSeconds(-5)).toBe("00:00");
    });

    it("handles multi-minute values", () => {
      expect(formatSeconds(125)).toBe("02:05");
      expect(formatSeconds(3599)).toBe("59:59");
    });
  });

  describe("formatTPlus", () => {
    it("prefixes T+ to the base format", () => {
      expect(formatTPlus(0)).toBe("T+00:00");
      expect(formatTPlus(142)).toBe("T+02:22");
    });
  });
});
