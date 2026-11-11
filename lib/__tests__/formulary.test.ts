import { describe, expect, it } from "vitest";
import index from "../../public/cpg-index.json";
import { CPG } from "../cpgEdition";
import { MEDICATION_ENTRIES } from "../cpgIndex";
import { FORMULARY, FORMULARY_DATA_EDITION, FORMULARY_EDITION, SOURCE_FLAGS, findDrug, pairCells } from "../formulary";

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

  it("source flags point at real dose rows", () => {
    for (const f of SOURCE_FLAGS) {
      const d = findDrug(f.drug);
      const row = d?.dosing[f.population]?.find((g) => g.indication === f.indication)?.rows.find((r) => r.route === f.route);
      expect(row, `${f.drug} ${f.indication} ${f.route}`).toBeTruthy();
      expect(f.ref.v).toBe(FORMULARY_EDITION.version);
      expect(row!.page).toBe(f.ref.page);
    }
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
