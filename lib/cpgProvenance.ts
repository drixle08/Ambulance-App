import type { CpgVersion } from "./cpgEdition";

/**
 * Per-value provenance for clinical content.
 *
 * Put these next to the value they support. The version is always a literal:
 * it records which edition someone actually checked, not the edition shipped.
 * scripts/cpg-provenance.mjs scans for these calls, lists any pinned to an
 * older edition, and checks current-edition quotes against the shipped PDF's
 * page text (public/cpg-index.json). Keep call arguments as plain literals so
 * the scanner can read them.
 */

/** The value is stated in the CPG: `quote` appears on printed page `page`. */
export type CpgRef = { kind: "ref"; v: CpgVersion; page: number; quote: string };

/**
 * The value is NOT in the CPG (extended scope / departmental). If `pattern`
 * is given (a regex source, matched case-insensitively), the check verifies it
 * appears nowhere in the shipped edition.
 */
export type CpgAbsent = { kind: "absent"; v: CpgVersion; what: string; pattern?: string };

export type CpgProvenance = CpgRef | CpgAbsent;

export function cpgRef(v: CpgVersion, page: number, quote: string): CpgRef {
  return { kind: "ref", v, page, quote };
}

export function cpgAbsent(v: CpgVersion, what: string, pattern?: string): CpgAbsent {
  return { kind: "absent", v, what, ...(pattern ? { pattern } : {}) };
}
