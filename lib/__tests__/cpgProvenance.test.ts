import { describe, expect, it } from "vitest";
import {
  checkProvenance,
  formatReport,
  loadPageText,
  quoteOnPage,
  scanMarkers,
} from "../../scripts/cpg-provenance.mjs";
import { CPG, CPG_VERSION, cpgEdition } from "../cpgEdition";

const problemCount = (result: ReturnType<typeof checkProvenance>) =>
  Object.values(result.problems).reduce((n: number, list) => n + (list as unknown[]).length, 0);

describe("CPG provenance", () => {
  it("every edition-pinned claim matches the shipped edition and its cited page", () => {
    // On failure the message is the full re-verification list (same as npm run cpg:reverify).
    const result = checkProvenance();
    expect(problemCount(result), formatReport(result)).toBe(0);
  });

  it("finds the markers it is meant to check", () => {
    const { markers, unparsed } = scanMarkers();
    // Sanity floor: care-bundles + RSI carry ~90 page references.
    expect(markers.filter((m: { kind: string }) => m.kind === "ref").length).toBeGreaterThan(80);
    expect(markers.some((m: { kind: string }) => m.kind === "edition")).toBe(true);
    expect(markers.some((m: { kind: string }) => m.kind === "absent")).toBe(true);
    expect(unparsed).toEqual([]);
  });

  it("rejects a quote on the wrong page or with a wrong value", () => {
    const { pages } = loadPageText();
    expect(quoteOnPage(pages, 293, "PEEP at 10cmH2O, increase up to 12 - 15 cmH2O")).toBe(true);
    expect(quoteOnPage(pages, 292, "PEEP at 10cmH2O, increase up to 12 - 15 cmH2O")).toBe(false);
    expect(quoteOnPage(pages, 293, "PEEP at 5cmH2O")).toBe(false);
  });

  it("turns an edition bump into a re-verification list", () => {
    const result = checkProvenance({ current: "2.5" });
    // Nothing follows the bump silently: every claim is listed for re-checking.
    expect(result.problems.stale.length).toBe(result.markers.length);
    expect(result.problems.setup.some((s: string) => s.includes("cpg-index.json"))).toBe(true);
  });

  it("derives the shipped edition from one source", () => {
    expect(CPG.version).toBe(CPG_VERSION);
    expect(CPG.pdfPath).toBe(`/reference/cpg/${CPG.pdfFile}`);
    expect(cpgEdition("2.6")).toMatchObject({ tag: "v2.6", short: "v2.6 2026", label: "CPG v2.6 (2026)" });
  });
});
