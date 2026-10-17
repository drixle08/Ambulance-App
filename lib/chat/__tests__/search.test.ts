import { describe, expect, it } from "vitest";
import { normaliseTokens, searchPages } from "../search";

// Each question must surface at least one of the expected CPG pages in the top 5.
// Expected pages were checked against the CPG v2.6 text index.
type Case = { question: string; expected: number[] };

const CASES: Case[] = [
  { question: "What is the adrenaline dose for adult cardiac arrest?", expected: [299, 300, 301] },
  { question: "epinephrine dose in cardiac arrest adult", expected: [299, 300, 301] },
  { question: "Amiodarone dose for adult VF arrest", expected: [303, 304] },
  { question: "paediatric adrenaline dose cardiac arrest", expected: [42, 43, 46, 47, 299, 300, 301, 302] },
  { question: "How do I estimate weight in a paeds arrest?", expected: [43, 47] },
  { question: "CPR induced consciousness ketamine", expected: [35, 39, 43, 47, 59] },
  { question: "When can I terminate resuscitation?", expected: [57] },
  { question: "Hyperkalaemia in cardiac arrest calcium chloride", expected: [58] },
  { question: "Hypothermic cardiac arrest adrenaline", expected: [58, 169] },
  { question: "Defibrillation energy LP15 joules", expected: [37, 41] },
  { question: "vector change defibrillation pad placement", expected: [34, 38] },
];

describe("searchPages", () => {
  it.each(CASES)("finds the right page for: $question", ({ question, expected }: Case) => {
    const top = searchPages(question, { types: ["cpg"], limit: 5 }).map((h) => h.printedPage);
    expect(top.some((p) => expected.includes(p)), `got pages ${top.join(", ")}`).toBe(true);
  });

  it("tags pages with their protocol section", () => {
    const [hit] = searchPages("vector change defibrillation pad placement", { types: ["cpg"], limit: 1 });
    expect(hit.section).toMatch(/CPG 2\.1/);
  });
});

describe("normaliseTokens", () => {
  it("unifies spelling, synonyms and plurals", () => {
    expect(normaliseTokens("Paediatric dosage")).toEqual(normaliseTokens("pediatric doses"));
    expect(normaliseTokens("epinephrine")).toEqual(["adrenaline"]);
    expect(normaliseTokens("haemorrhage")).toEqual(["hemorrhage"]);
  });
});
