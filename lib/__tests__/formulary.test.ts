import { describe, expect, it } from "vitest";
import index from "../../public/cpg-index.json";
import { CPG } from "../cpgEdition";
import { MEDICATION_ENTRIES, formularyHref, formularyId } from "../cpgIndex";
import {
  CONDITION_CPG_DOSES,
  CONDITION_CPG_EXTRAS,
  CONDITION_CPG_WARNINGS,
  FORMULARY,
  FORMULARY_DATA_EDITION,
  FORMULARY_EDITION,
  conditionCpgDoses,
  conditionTableNotes,
  findDrug,
  pairCells,
} from "../formulary";

// The generator only changes whitespace (re-inserted line breaks), so every
// value must still be on its cited page once whitespace is collapsed.
const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const pageText = new Map<number, string>(
  (index as { chunks: { printedPage: number; text: string }[] }).chunks.map((c) => [c.printedPage, norm(c.text)]),
);
const onPage = (needle: string, ...pages: number[]) => pages.some((p) => pageText.get(p)?.includes(norm(needle)));

describe("Formulary data", () => {
  it("is built from the shipped CPG edition", () => {
    expect(FORMULARY_EDITION.version).toBe(CPG.version);
    expect(FORMULARY_DATA_EDITION).toBe(FORMULARY_EDITION.version);
    expect((index as { source: string }).source).toBe(CPG.pdfFile);
  });

  it("search links (formularyId/formularyHref) resolve to the generated drug ids", () => {
    for (const m of MEDICATION_ENTRIES) {
      expect(findDrug(formularyId(m.name))?.name, m.name).toBe(m.name);
      expect(formularyHref(m)).toBe(`/tools/formulary?drug=${formularyId(m.name)}`);
    }
  });

  it("covers every formulary medication in the CPG index, in order", () => {
    expect(FORMULARY.map((d) => d.name)).toEqual(MEDICATION_ENTRIES.map((m) => m.name));
    expect(FORMULARY.map((d) => d.pages.start)).toEqual(MEDICATION_ENTRIES.map((m) => m.formularyPage));
  });

  it("every dose row is verbatim on its cited CPG page", () => {
    const missing: string[] = [];
    for (const d of FORMULARY)
      for (const pop of ["adult", "paediatric"] as const)
        for (const g of d.dosing[pop] ?? [])
          for (const r of g.rows)
            if (!onPage(`${r.route} | ${r.dose}`, r.page)) missing.push(`${d.name} ${pop} ${g.indication} ${r.route} (p.${r.page})`);
    expect(missing).toEqual([]);
  });

  it("every paediatric table value is on the table's page", () => {
    const missing: string[] = [];
    for (const d of FORMULARY)
      for (const t of d.paediatricTables)
        for (const row of t.rows)
          for (const c of row.cells)
            if (!onPage(c.value, t.page, t.page + 1)) missing.push(`${d.name} ${row.age} ${c.group}: ${c.value}`);
    expect(missing).toEqual([]);
  });

  it("every drug has dosing, indications, contraindications and routes", () => {
    for (const d of FORMULARY) {
      expect(d.dosing.adult ?? d.dosing.paediatric, d.name).toBeTruthy();
      expect(d.indications.length, d.name).toBeGreaterThan(0);
      expect(d.contraindications.length, d.name).toBeGreaterThan(0);
      expect(d.routes.length, d.name).toBeGreaterThan(0);
      for (const pop of ["adult", "paediatric"] as const)
        for (const g of d.dosing[pop] ?? []) expect(g.rows.length, `${d.name} ${g.indication}`).toBeGreaterThan(0);
    }
  });

  it("keeps known CPG facts that are easy to break in parsing", () => {
    const amio = findDrug("amiodarone")!;
    expect(amio.dosing.adult![0]).toMatchObject({ indication: "Cardiac Arrest" });
    expect(amio.dosing.adult![0].rows[0].dose).toBe("300mg after 3rd shock\n150mg after 4th shock");
    // TXA epistaxis IV row continues onto the next page
    const txa = findDrug("tranexamic-acid")!;
    expect(txa.dosing.adult!.find((g) => g.indication === "Epistaxis")!.rows.map((r) => r.route)).toEqual(["Topical", "IV"]);
    // Adult-only and paediatric-only drugs
    expect(findDrug("aspirin")!.dosing.paediatric).toBeNull();
    expect(findDrug("budesonide")!.dosing.adult).toBeNull();
    // One shared ADULT & PAEDIATRIC block
    const penthrox = findDrug("methoxyflurane")!;
    expect(penthrox.dosing.shared).toBe(true);
    expect(penthrox.dosing.paediatric).toEqual(penthrox.dosing.adult);
  });

  it("condition-CPG doses attach to real formulary indications, rows and table columns", () => {
    expect(CONDITION_CPG_DOSES.length).toBeGreaterThanOrEqual(20);
    for (const c of CONDITION_CPG_DOSES) {
      const drug = findDrug(c.drug);
      expect(drug, c.drug).toBeTruthy();
      for (const indication of c.indications) {
        const group = drug!.dosing[c.population]?.find((g) => g.indication === indication);
        expect(group, `${c.drug} ${c.population} "${indication}"`).toBeTruthy();
        for (const f of c.formularyRows ?? [])
          expect(group!.rows.some((r) => r.route === f.route), `${c.drug} "${indication}" row ${f.route}`).toBe(true);
      }
      for (const t of c.tableGroups ?? [])
        expect(
          drug!.paediatricTables.some((tbl) => Object.keys(tbl.groupNotes ?? {}).includes(t.group)),
          `${c.drug} table column ${t.group}`,
        ).toBe(true);
      expect(c.refs.length, c.drug).toBeGreaterThan(0);
      for (const ref of c.refs) expect(ref.v).toBe(FORMULARY_EDITION.version);
      // The headline page is one the entry actually quotes
      expect(c.refs.map((r) => r.page), `${c.drug} ${c.cpg}`).toContain(c.page);
    }
  });

  it("condition-specific extras and warnings name real drugs and quote their page", () => {
    for (const x of [...CONDITION_CPG_EXTRAS, ...CONDITION_CPG_WARNINGS]) {
      expect(findDrug(x.drug), x.drug).toBeTruthy();
      expect(x.refs.map((r) => r.page), `${x.drug} ${x.cpg}`).toContain(x.page);
    }
    expect(CONDITION_CPG_EXTRAS.length).toBeGreaterThanOrEqual(9);
    expect(CONDITION_CPG_WARNINGS.map((w) => w.drug).sort()).toEqual(["ibuprofen", "paracetamol"]);
  });

  it("follows the condition CPG for the approved high-priority conflicts", () => {
    const one = (id: string, pop: "adult" | "paediatric", indication: string) => {
      const list = conditionCpgDoses(findDrug(id)!, pop, indication);
      expect(list.length, `${id} ${pop} ${indication}`).toBe(1);
      return list[0];
    };
    expect(one("tranexamic-acid", "adult", "Traumatic Brain Injury GCS ≤ 12").lines).toEqual(["TXA 2g"]);
    expect(one("amiodarone", "adult", "Cardiac Arrest").lines[0]).toContain("150mg after the 5th shock");
    expect(one("amiodarone", "paediatric", "Cardiac Arrest").lines[0]).toContain("5mg/kg (max 150mg) after the 5th shock");
    expect(one("dextrose", "paediatric", "Hypoglycaemia")).toMatchObject({ scope: "Cardiac arrest", lines: ["Sugar: 2ml/kg of 10% Dextrose (0.2g/kg)"] });
    expect(one("naloxone", "adult", "Opioid Overdose").lines[0]).toContain("(max 2000mcg)");
    // Scoped entries stack with others on the same indication without replacing them
    expect(conditionCpgDoses(findDrug("atropine")!, "adult", "Bradycardia")[0].scope).toBe(
      "Beta-blocker or calcium channel blocker toxicity",
    );
    expect(conditionTableNotes(findDrug("dextrose")!, "Hypoglycaemia in cardiac arrest & ROSC")).toHaveLength(1);
  });

  it("pairs each table dose with its volume", () => {
    const amio = findDrug("amiodarone")!.paediatricTables[0];
    const band = amio.rows.find((r) => r.weight === "12-15kg")!;
    expect(pairCells(band.cells)).toEqual([
      { group: "VF/Pulseless VT", label: "5mg/kg IV/IO", value: "65mg", volume: "1.3ml" },
      { group: "SVT/ VT with pulse", label: "5mg/kg IV infusion over 20- 60 minutes", value: "65mg", volume: "1.3ml" },
    ]);
  });

  it("pairs volumes in multi-level tables and keeps merged 'not indicated' cells", () => {
    const ketamine = findDrug("ketamine")!.paediatricTables;
    const analgesia = pairCells(ketamine[0].rows.find((r) => r.weight === "12-15kg")!.cells);
    expect(analgesia[0]).toEqual({
      group: "Analgesia IV/IO",
      label: "0.25-0.5mg/kg IV/IO · 0.25mg/kg IV/IO",
      value: "3mg",
      volume: "0.6ml",
    });
    // No unpaired volume rows anywhere in the formulary
    for (const d of FORMULARY)
      for (const t of d.paediatricTables)
        for (const r of t.rows)
          for (const c of pairCells(r.cells)) expect(/\d\s*ml$/i.test(c.value) && c.label === "", `${d.name} ${r.age}`).toBe(false);
    const rsi = pairCells(ketamine[2].rows.find((r) => r.weight === "12-15kg")!.cells);
    expect(rsi[0]).toMatchObject({ label: "1mg/kg IV/IO", value: "Not indicated in this age group for intubation" });
    expect(rsi[0].volume).toBeUndefined();
  });
});
