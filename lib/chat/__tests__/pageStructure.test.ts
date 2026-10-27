import { describe, expect, it } from "vitest";
import { CPG_ENTRIES, MEDICATION_ENTRIES } from "../../cpgIndex";
import { getPages } from "../search";

// Guards for the structured CPG index (scripts/build-cpg-index.mjs). Each case
// is a place where the old one-line page text let a value be read against the
// wrong patient group, column or row.

const page = (n: number) => {
  const [doc] = getPages("cpg", [n]);
  if (!doc) throw new Error(`CPG p.${n} missing from the index`);
  return doc;
};
const lines = (n: number) => page(n).text.split("\n");

/** The lines under a "[LABEL]" marker, up to the next marker or blank line. */
function block(n: number, label: string): string {
  const all = lines(n);
  const start = all.indexOf(`[${label}]`);
  if (start < 0) return "";
  const end = all.findIndex((l, i) => i > start && (l === "" || l.startsWith("[")));
  return all.slice(start + 1, end < 0 ? undefined : end).join("\n");
}

describe("flowchart columns (p.91 asthma)", () => {
  it("keeps adult and paediatric doses in their own columns", () => {
    expect(block(91, "PAEDIATRIC")).toContain("Salbutamol – 2.5-5mg");
    expect(block(91, "ADULT")).toContain("Salbutamol – 5mg");
    expect(block(91, "PAEDIATRIC › MODERATE")).toContain("Magnesium 25-50mg/kg IV");
    expect(block(91, "ADULT › MODERATE")).toContain("Magnesium 1-2g IV");
  });

  it("labels nested columns (p.119 hypo/hyperglycaemia)", () => {
    expect(block(119, "HYPOGLYCAEMIA › PAEDIATRIC")).toContain("Dextrose 10% IV 5ml/kg");
    expect(block(119, "HYPOGLYCAEMIA › ADULT")).toContain("Dextrose 10% IV 150-200ml");
  });
});

describe("dosing table cells (p.302 paediatric adrenaline)", () => {
  const row = (age: string) => lines(302).find((l) => l.startsWith(`Age: ${age} |`)) ?? "";

  it("labels the 1-3 year cardiac-arrest volume as cardiac arrest at 1:10 000", () => {
    expect(row("1-3 years")).toMatch(/Cardiac arrest › Volume[^|]*1:10 000\): 1\.5ml/);
    expect(row("1-3 years")).toMatch(/Anaphylaxis[^|]*Volume[^|]*: 0\.15ml/);
  });

  it("repeats each merged anaphylaxis cell into exactly the rows it spans", () => {
    for (const age of ["Preterm", "Term-2 months", "3-7 months", "8-12 months", "1-3 years", "4-5 years"]) {
      expect(row(age), age).toContain("<6 years = 0.15mg");
    }
    for (const age of ["6-7 years", "8-9 years", "10-11 years"]) expect(row(age), age).toContain("6-12 years = 0.3mg");
    for (const age of ["12-13 years", "≥14 years"]) expect(row(age), age).toContain(">12 years = 0.5mg");
    expect(row("6-7 years")).not.toContain("<6 years");
  });

  it("repeats the merged croup 5mg cell from 8-12 months down", () => {
    expect(row("3-7 months")).toMatch(/Croup[^|]*: 3mg/);
    for (const age of ["8-12 months", "1-3 years", "≥14 years"]) expect(row(age), age).toMatch(/Croup[^|]*0\.5mg\/kg Neb[^|]*: 5mg/);
  });
});

describe("tables without tagged headers", () => {
  it("labels RSI doses with their haemodynamic group and weight band (p.217)", () => {
    const ketamine = lines(217).find((l) => l.startsWith("KETAMINE (1-2 mg/kg)")) ?? "";
    expect(ketamine).toContain("HAEMODYNAMICALLY UNSTABLE › S: 50");
    expect(ketamine).toContain("HAEMODYNAMICALLY STABLE › L: 200");
  });

  it("names every age band a merged vital-sign threshold covers (p.125)", () => {
    expect(page(125).text).toContain("< (Age x 2) + 70 [spans: 1 – 2yr / 3 – 5yr / 6 – 9yr / >10yr]");
    expect(page(125).text).toMatch(/0 – 1mon: ≤100 or ≥180/);
  });
});

describe("symbols and routes", () => {
  it("keeps the medication privileges ticks per level (p.399)", () => {
    expect(lines(399)).toContain("MEDICATION: Adrenaline IM | Level 4: ✓ | Level 3: ✓ | Level 2: ✓");
    expect(lines(399)).toContain("MEDICATION: Adenosine | Level 4: ✓");
  });

  it("keeps a route abbreviation drawn after a level placeholder (p.310 IV/IO)", () => {
    expect(page(310).text).toMatch(/^IV\/IO \| 0\.02mg\/kg/m);
  });
});

describe("flowchart boxes", () => {
  it("restates the column label on each box, not only when it changes (p.116)", () => {
    expect(block(116, "ADULT")).toBeTruthy();
    const adultBoxes = page(116).text.split("\n\n").filter((b) => b.startsWith("[ADULT]"));
    expect(adultBoxes.some((b) => b.includes("Diphenhydramine 50mg IV/IM"))).toBe(true);
    expect(page(116).text).not.toContain("[• RSI]");
  });
});

describe("dosing sections continued across pages", () => {
  it("marks a page that starts mid paediatric section", () => {
    expect(page(302).text.startsWith("(continued from previous page: PAEDIATRIC dosing)")).toBe(true);
  });

  it("marks a page that starts mid adult section (p.301 adrenaline)", () => {
    expect(page(301).text.startsWith("(continued from previous page: ADULT dosing)")).toBe(true);
  });

  it("does not carry a dosing section into the appendices", () => {
    for (const n of [398, 399, 401]) expect(page(n).text.startsWith("(continued"), `p.${n}`).toBe(false);
  });
});

describe("practitioner-level placeholders", () => {
  it("drops the near-white I / II / III placeholders from formulary dose tables", () => {
    expect(page(333).text).not.toMatch(/\bII I\b/);
  });
});

describe("page labels", () => {
  it("puts every protocol heading at the top of its listed start page", () => {
    for (const e of CPG_ENTRIES) {
      const text = page(e.printedPage).text;
      const at = text.search(new RegExp(`(^|\\n)(Columns: )?${e.code.replace(" ", "\\s?").replace(/\./g, "\\.")}(?![.\\d])`));
      expect(at, `${e.code} on p.${e.printedPage}`).toBeGreaterThanOrEqual(0);
      expect(at, `${e.code}: other content before its heading on p.${e.printedPage}`).toBeLessThan(120);
    }
  });

  it("starts every formulary entry on its listed page", () => {
    for (const m of MEDICATION_ENTRIES) {
      const head = page(m.formularyPage).text.slice(0, 120).toLowerCase();
      // The CPG's own spellings vary (e.g. "METOCLOPROMIDE", "GLYCERAL TRINITRATE – GTN").
      const names = [m.name.slice(0, 6), ...m.aliases].map((n) => n.toLowerCase());
      expect(names.some((n) => head.includes(n)), `${m.name} on p.${m.formularyPage}`).toBe(true);
    }
  });

  it("labels pages outside any protocol or drug by what they are", () => {
    expect(page(295).section).toBe("CPG Formulary Formulary Contents");
    expect(page(396).section).toMatch(/Vecuronium/);
    expect(page(398).section).toMatch(/Extended Pharmacopoeia/);
    expect(page(400).section).toMatch(/Medication Privileges/);
    for (const n of [401, 405, 410]) expect(page(n).section, `p.${n}`).toBe("CPG References");
  });
});
