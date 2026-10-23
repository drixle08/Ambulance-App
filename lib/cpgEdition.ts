import data from "./cpgEdition.json";

/**
 * Single source of truth for the HMCAS CPG edition (data lives in
 * cpgEdition.json so the Node build scripts read the same values).
 *
 * Two different things carry an edition, and they are kept apart on purpose:
 *
 * - CPG — the document this build ships (PDF, search index, Clinical
 *   Assistant). It follows "current" in cpgEdition.json automatically.
 *
 * - Content that was checked against an edition — tool labels, clinical
 *   values, "not in the CPG" claims. These name their edition explicitly with
 *   cpgEdition("x.y") / cpgRef / cpgAbsent (lib/cpgProvenance.ts) and never
 *   follow "current". Bumping the edition therefore cannot re-label unchecked
 *   content; instead `npm run cpg:reverify` (and the provenance test) lists
 *   everything still pinned to an older edition.
 */

export type CpgVersion = keyof typeof data.editions;

export type CpgEdition = {
  version: CpgVersion;
  year: number;
  /** "v2.6" */
  tag: string;
  /** "v2.6 2026" */
  short: string;
  /** "CPG v2.6 (2026)" */
  label: string;
};

export function cpgEdition(version: CpgVersion): CpgEdition {
  const { year } = data.editions[version];
  return {
    version,
    year,
    tag: `v${version}`,
    short: `v${version} ${year}`,
    label: `CPG v${version} (${year})`,
  };
}

export const CPG_VERSION = data.current as CpgVersion;

/** The edition shipped with this build. */
export const CPG = {
  ...cpgEdition(CPG_VERSION),
  pdfFile: data.editions[CPG_VERSION].pdfFile,
  pdfPath: `/reference/cpg/${data.editions[CPG_VERSION].pdfFile}`,
};

/**
 * Edition the app as a whole was last aligned with (landing page, About).
 * A claim about content, so it is pinned like any other.
 */
export const APP_ALIGNED_EDITION = cpgEdition("2.6");
