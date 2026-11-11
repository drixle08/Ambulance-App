import data from "./formulary.json";
import { cpgEdition, type CpgVersion } from "./cpgEdition";
import { cpgRef, type CpgRef } from "./cpgProvenance";

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
 * Places where the CPG text contradicts itself. Shown as printed, with a flag,
 * so the crew checks before acting. Keyed by drug id / population / indication / route.
 */
export const SOURCE_FLAGS: {
  drug: string;
  population: Population;
  indication: string;
  route: string;
  note: string;
  ref: CpgRef;
}[] = [
  {
    drug: "tranexamic-acid",
    population: "adult",
    indication: "Traumatic Brain Injury GCS ≤ 12",
    route: "IV",
    note: "The CPG gives a 2 g dose here but says to add 1 g to 100 ml NS. The IV/IO row above says add 2 g. Confirm with the Clinical Desk if unsure.",
    ref: cpgRef("2.6", 393, "IV 2g (4 x 500mg amps) Add 1g to 100ml NS"),
  },
];

export function sourceFlag(drug: FormularyDrug, population: Population, indication: string, route: string) {
  return SOURCE_FLAGS.find(
    (f) => f.drug === drug.id && f.population === population && f.indication === indication && f.route === route,
  );
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
