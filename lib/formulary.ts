import data from "./formulary.json";
import { cpgEdition, type CpgVersion } from "./cpgEdition";
import { cpgRef, type CpgRef } from "./cpgProvenance";

// Paediatric dosing tables are banded by weight AND age, and the CPG's age labels
// are not consistent between tables (12-15kg is "1-3 years" in most, "2-3 years" in
// Paracetamol, Rocuronium, Salbutamol, Vecuronium). Rule (HMCAS practice): for
// weight-based dosing, weight governs. The tool selects and emphasises weight and
// shows each table's age label as printed.

/**
 * CPG formulary data for the Formulary tool.
 *
 * lib/formulary.json is generated from the shipped CPG page text by
 * `npm run build:formulary` (scripts/build-formulary.mjs). Do not hand-edit
 * it: regenerate after an edition change and review the diff. The test in
 * lib/__tests__/formulary.test.ts checks every dose against its CPG page.
 */

export type Bullet = { text: string; sub?: string[] };
export type DoseRow = { route: string; dose: string; page: number };
export type DoseGroup = { indication: string; rows: DoseRow[] };
export type TableCell = { group: string; label: string; value: string };
export type TableRow = { age: string; weight: string; cells: TableCell[] };
export type DoseTable = {
  title: string;
  page: number;
  header: string[][];
  notes: { group?: string; text: string }[];
  groupNotes?: Record<string, string[]>;
  rows: TableRow[];
};
export type Privilege = { route: string | null; levels: number[]; page: number };
export type Population = "adult" | "paediatric";

export type FormularyDrug = {
  id: string;
  name: string;
  cpgTitle: string;
  pages: { start: number; end: number };
  class: string;
  action: string;
  metabolism: string;
  indications: Bullet[];
  contraindications: Bullet[];
  precautions: Bullet[];
  sideEffects: Bullet[];
  routes: string[];
  specialNotes: Bullet[];
  pharmacokinetics: { onset?: string; duration?: string; halfLife?: string };
  /** `shared`: the CPG gives one "ADULT & PAEDIATRIC" block (Methoxyflurane). */
  dosing: { adult: DoseGroup[] | null; paediatric: DoseGroup[] | null; shared: boolean };
  paediatricTables: DoseTable[];
  privileges: Privilege[];
};

/**
 * Edition the formulary data was generated from and reviewed against. A literal,
 * like every edition pin, so `npm run cpg:reverify` lists this tool when the
 * shipped CPG moves on. The test checks it matches lib/formulary.json.
 */
export const FORMULARY_EDITION = cpgEdition("2.6");
export const FORMULARY_DATA_EDITION = data.edition as CpgVersion;
export const FORMULARY: FormularyDrug[] = data.drugs as FormularyDrug[];

export function findDrug(id: string | null | undefined): FormularyDrug | undefined {
  return id ? FORMULARY.find((d) => d.id === id) : undefined;
}

/** Other name from the CPG heading, e.g. "ADRENALINE (EPINEPHRINE)" -> "Epinephrine". */
export function alsoKnownAs(drug: FormularyDrug): string | null {
  const m = drug.cpgTitle.match(/\(([^)]+)\)/);
  if (!m || m[1].includes("&")) return null; // "(SL & IV)", "(ORAL & IV)" describe routes, not a name
  const s = m[1].replace(/®/g, "").trim();
  if (s.length <= 4) return s; // acronym: "TXA"
  return s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s;
}

/** Privileging levels as the CPG names them (Specific Clinical Privileges, p.7). */
export const PRIVILEGE_LEVELS: Record<number, { short: string; long: string }> = {
  4: { short: "CCP", long: "Level 4 – full scope Critical Care Paramedic" },
  3: { short: "AP", long: "Level 3 – full scope Ambulance Paramedic" },
  2: { short: "AP (reduced)", long: "Level 2 – reduced scope Ambulance Paramedic" },
  1: { short: "FR", long: "Level 1 – First Responder" },
};

/**
 * Rule (HMCAS practice): when the formulary and the CPG for the patient's
 * condition differ, follow the condition CPG.
 *
 * Each entry is a formulary indication whose condition CPG gives a different
 * dose. The tool shows the formulary text as printed, with the condition CPG's
 * dose above it to follow instead. `refs` quote the condition CPG and are
 * checked against the shipped PDF by `npm run cpg:reverify`.
 * `formularyRows` marks formulary rows that conflict, so they carry a pointer.
 */
export type ConditionCpgDose = {
  drug: string;
  population: Population;
  /** The formulary indication heading, exactly as in lib/formulary.json. */
  indication: string;
  cpg: string;
  page: number;
  /** The condition CPG's own wording. */
  lines: string[];
  note?: string;
  formularyRows?: { route: string; note: string }[];
  refs: CpgRef[];
};

export const CONDITION_CPG_DOSES: ConditionCpgDose[] = [
  {
    drug: "tranexamic-acid",
    population: "adult",
    indication: "Traumatic Brain Injury GCS ≤ 12",
    cpg: "CPG 10.2 Traumatic Brain Injury",
    page: 175,
    lines: ["TXA 2g"],
    note: "Consider within the first 3 hours of injury, GCS ≤ 12.",
    formularyRows: [
      { route: "IV", note: "Formulary misprint: give the full 2 g as per CPG 10.2 (the IV/IO row adds 2 g to 100 ml NS)." },
    ],
    refs: [
      cpgRef("2.6", 175, "TXA 2g"),
      cpgRef("2.6", 174, "Consider TXA within first 3 hours of injury GCS ≤ 12"),
    ],
  },
  {
    drug: "magnesium-sulphate",
    population: "adult",
    indication: "Severe asthma/Torsade’s de pointes",
    cpg: "CPG 5.1 Asthma",
    page: 91,
    lines: [
      "Moderate: Magnesium 1-2g IV (consider if no response to other therapy)",
      "Severe: Magnesium 1-2g IV",
    ],
    note: "Asthma only. For Torsade’s de pointes the formulary dose below applies.",
    refs: [
      cpgRef("2.6", 91, "Magnesium 1-2g IV (consider if no response to other therapy)"),
      cpgRef("2.6", 91, "Magnesium 1-2g IV"),
    ],
  },
  {
    drug: "glycerol-trinitrate",
    population: "adult",
    indication: "Acute Pulmonary Oedema",
    cpg: "CPG 4.5 Acute Pulmonary Oedema",
    page: 82,
    lines: [
      "Normal to high BP: GTN Infusion (if no response to S/L GTN) – 100mcg/min",
      "High BP (SBP > 160mmHg): GTN Infusion – 100 - 300mcg/min. Adjust infusion based on the patients response",
      "SBP > 200mmHg – consider starting infusion at a higher dose of 400- 500mcg/min for ≈2 minutes and titrate down",
    ],
    formularyRows: [{ route: "IV/IO INF", note: "For high BP the CPG 4.5 rates above apply." }],
    refs: [
      cpgRef("2.6", 82, "GTN Infusion (if no response to S/L GTN) – 100mcg/min"),
      cpgRef("2.6", 82, "GTN Infusion – 100 - 300mcg/min. Adjust infusion based on the patients response"),
      cpgRef("2.6", 82, "SBP > 200mmHg – consider starting infusion at a higher dose of 400- 500mcg/min for ≈2 minutes and titrate down"),
    ],
  },
];

export function conditionCpgDose(drug: FormularyDrug, population: Population, indication: string) {
  return CONDITION_CPG_DOSES.find((c) => c.drug === drug.id && c.population === population && c.indication === indication);
}

/** A weight band's identity across drugs: weight when the table has it ("12-15kg"), else age. */
export function bandKey(row: TableRow): string {
  return row.weight || row.age;
}

/** Pairs each dose cell with the "Volume" cell that follows it in the CPG table. */
export function pairCells(cells: TableCell[]): { group: string; label: string; value: string; volume?: string }[] {
  const out: { group: string; label: string; value: string; volume?: string }[] = [];
  for (const c of cells) {
    const prev = out.at(-1);
    const isVolume = c.label === "Volume" || c.label.endsWith(" · Volume");
    if (isVolume && prev && prev.group === c.group && prev.volume === undefined) prev.volume = c.value;
    else out.push({ ...c, label: c.label.replace(/ · Volume$/, "") });
  }
  return out;
}
