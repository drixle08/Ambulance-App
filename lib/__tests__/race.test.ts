import { describe, expect, it } from "vitest";
import { EMPTY_RACE, raceItems, raceTotal } from "../race";

describe("RACE scale", () => {
  it("is incomplete until every item is scored", () => {
    expect(raceTotal(EMPTY_RACE)).toBeNull();
    expect(raceTotal({ ...EMPTY_RACE, face: 2, arm: 2, leg: 2, gaze: 1 })).toBeNull();
  });

  it("sums to a maximum of 9", () => {
    expect(raceTotal({ face: 2, arm: 2, leg: 2, gaze: 1, cortical: 2 })).toBe(9);
    expect(raceTotal({ face: 1, arm: 1, leg: 1, gaze: 0, cortical: 1 })).toBe(4);
  });

  it("tests aphasia for right hemiparesis and agnosia for left", () => {
    expect(raceItems("right").at(-1)?.label).toMatch(/^Aphasia/);
    expect(raceItems("left").at(-1)?.label).toMatch(/^Agnosia/);
  });
});
