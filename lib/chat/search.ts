import fs from "fs";
import path from "path";
import { CPG_ENTRIES, MEDICATION_ENTRIES } from "../cpgIndex";
import { CPM_ENTRIES } from "../cpmIndex";
import { SOP_ENTRIES } from "../sopIndex";

/**
 * Page-level BM25 search over the CPG, CPM and SOP text indexes.
 *
 * The index files store each PDF page as 1-4 chunks; we stitch them back into
 * whole pages, tag each page with the protocol/section it belongs to, and rank
 * pages with BM25 over normalised tokens (stemming, UK/US spelling, clinical
 * synonyms). Drug questions also pull in the drug's formulary pages.
 */

export type DocType = "cpg" | "cpm" | "sop";

export type PageDoc = {
  type: DocType;
  /** PDF page number (1-based). */
  page: number;
  /** Page number printed on the page — what users and citations refer to. */
  printedPage: number;
  /** Protocol / section this page belongs to, e.g. "CPG 2.1 Adult Medical Cardiac Arrest". */
  section: string;
  /** Short code for labels, e.g. "CPG 2.1", "SOP 4.3", "CPM 7.5". */
  code: string;
  text: string;
};

export type SearchHit = PageDoc & { score: number };

type IndexChunk = { page: number; printedPage: number; text: string };

const INDEX_FILES: Record<DocType, string> = {
  cpg: "cpg-index.json",
  cpm: "cpm-index.json",
  sop: "sop-index.json",
};

// ─── Text normalisation ──────────────────────────────────────────────────────

const STOP_WORDS = new Set(
  (
    "the and or of to in for on with an at by as be is are was were from that this it can may if " +
    "per up down what which when how who whom do does should would could will my our your their " +
    "there about into than then them they we you i me give given giving tell use used using need " +
    "patient patients pt"
  ).split(" ")
);

/** Clinical synonyms → canonical token. Applied to both pages and queries. */
const CANONICAL: Record<string, string> = {
  dosage: "dose", dosing: "dose", doses: "dose", dosed: "dose",
  epinephrine: "adrenaline", adrenalin: "adrenaline", epi: "adrenaline",
  norepinephrine: "noradrenaline", norepi: "noradrenaline", levophed: "noradrenaline",
  pediatric: "pediatric", peds: "pediatric", paeds: "pediatric", peads: "pediatric",
  child: "pediatric", children: "pediatric", kid: "pediatric", kids: "pediatric",
  infant: "pediatric", infants: "pediatric",
  nitroglycerin: "gtn", nitro: "gtn", ntg: "gtn",
  txa: "tranexamic",
  suxamethonium: "succinylcholine", sux: "succinylcholine",
  acetaminophen: "paracetamol",
  albuterol: "salbutamol", ventolin: "salbutamol",
  narcan: "naloxone",
  frusemide: "furosemide", lasix: "furosemide",
  seizures: "seizure", convulsion: "seizure", convulsions: "seizure", fitting: "seizure",
  cva: "stroke",
  anaphylactic: "anaphylaxis",
  asthmatic: "asthma",
  hypoglycemic: "hypoglycemia",
  hypotensive: "hypotension", hypertensive: "hypertension",
  tachycardic: "tachycardia", bradycardic: "bradycardia",
  defib: "defibrillation", defibrillate: "defibrillation", shock: "shock",
  intubation: "intubate", intubated: "intubate", eti: "intubate", ett: "intubate",
  rosc: "rosc", cpr: "cpr",
  tor: "termination", terminate: "termination", terminating: "termination",
};

function stem(token: string): string {
  if (token.length <= 4) return token;
  if (token.endsWith("ies")) return token.slice(0, -3) + "y";
  if (token.endsWith("sses")) return token.slice(0, -2);
  if (token.endsWith("s") && !token.endsWith("ss") && !token.endsWith("us") && !token.endsWith("is")) {
    return token.slice(0, -1);
  }
  return token;
}

export function normaliseTokens(text: string): string[] {
  const out: string[] = [];
  const raw = text.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ");
  for (const original of raw) {
    if (original.length < 2 || STOP_WORDS.has(original)) continue;
    if (/^\d+$/.test(original)) continue;
    // UK → US spelling: paediatric → pediatric, haemorrhage → hemorrhage, oedema → edema
    const word = original.replace(/ae/g, "e").replace(/oe(?=[a-z])/g, "e");
    const canonical = CANONICAL[word] ?? stem(word);
    out.push(CANONICAL[canonical] ?? canonical);
  }
  return out;
}

function cleanPageText(text: string): string {
  return text
    .replace(/HMCAS CPG VERSION 2\. ?6 20\s?2\s?6 \d+/g, "")
    .replace(/▪?\s*BACK TO TABLE OF CONTENTS\s*▪?\s*(BACK TO FORMULARY)?/g, "")
    .replace(/Return to Table of Contents Version [\d.]+ – \w+ \d{4} Page \d+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Section lookup ──────────────────────────────────────────────────────────

type SectionMark = { printedPage: number; code: string; title: string };

function sectionMarks(type: DocType): SectionMark[] {
  const marks: SectionMark[] =
    type === "cpg"
      ? [
          ...CPG_ENTRIES.map((e) => ({ printedPage: e.printedPage, code: e.code, title: e.title })),
          ...MEDICATION_ENTRIES.map((m) => ({
            printedPage: m.formularyPage,
            code: "CPG Formulary",
            title: `${m.name} (${m.class ?? "drug"})`,
          })),
        ]
      : type === "cpm"
        ? CPM_ENTRIES.map((e) => ({ printedPage: e.printedPage, code: `CPM ${e.code}`, title: e.title }))
        : SOP_ENTRIES.map((e) => ({ printedPage: e.printedPage, code: e.code, title: e.title }));
  return marks.sort((a, b) => a.printedPage - b.printedPage);
}

function sectionFor(marks: SectionMark[], printedPage: number): SectionMark | null {
  let found: SectionMark | null = null;
  for (const mark of marks) {
    if (mark.printedPage > printedPage) break;
    found = mark;
  }
  return found;
}

// ─── Index (built once per server instance) ──────────────────────────────────

type Posting = { doc: PageDoc; tf: Map<string, number>; length: number };
type Corpus = { docs: Posting[]; df: Map<string, number>; avgLength: number; byPrinted: Map<number, PageDoc> };

let corpora: Record<DocType, Corpus> | null = null;

function buildCorpus(type: DocType): Corpus {
  const file = path.join(process.cwd(), "public", INDEX_FILES[type]);
  const chunks: IndexChunk[] = JSON.parse(fs.readFileSync(file, "utf8")).chunks ?? [];

  const pages = new Map<number, { page: number; printedPage: number; parts: string[] }>();
  for (const chunk of chunks) {
    const entry = pages.get(chunk.page) ?? { page: chunk.page, printedPage: chunk.printedPage, parts: [] };
    entry.parts.push(chunk.text);
    pages.set(chunk.page, entry);
  }

  const marks = sectionMarks(type);
  const docs: Posting[] = [];
  const df = new Map<string, number>();
  const byPrinted = new Map<number, PageDoc>();

  for (const { page, printedPage, parts } of [...pages.values()].sort((a, b) => a.page - b.page)) {
    const mark = sectionFor(marks, printedPage);
    const doc: PageDoc = {
      type,
      page,
      printedPage,
      section: mark ? `${mark.code} ${mark.title}` : "",
      code: mark?.code ?? type.toUpperCase(),
      text: cleanPageText(parts.join("")),
    };
    // Section title counts twice so short/flowchart pages still match their protocol.
    const tokens = normaliseTokens(`${doc.section} ${doc.section} ${doc.text}`);
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    docs.push({ doc, tf, length: tokens.length });
    byPrinted.set(printedPage, doc);
  }

  const avgLength = docs.reduce((sum, d) => sum + d.length, 0) / Math.max(docs.length, 1);
  return { docs, df, avgLength, byPrinted };
}

function getCorpora(): Record<DocType, Corpus> {
  corpora ??= { cpg: buildCorpus("cpg"), cpm: buildCorpus("cpm"), sop: buildCorpus("sop") };
  return corpora;
}

// ─── Search ──────────────────────────────────────────────────────────────────

const K1 = 1.2;
const B = 0.75;

function bm25(corpus: Corpus, queryTokens: string[]): SearchHit[] {
  const n = corpus.docs.length;
  const unique = [...new Set(queryTokens)];
  const hits: SearchHit[] = [];
  for (const posting of corpus.docs) {
    let score = 0;
    let matched = 0;
    for (const term of unique) {
      const freq = posting.tf.get(term);
      if (!freq) continue;
      matched++;
      const df = corpus.df.get(term) ?? 0;
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
      score += (idf * freq * (K1 + 1)) / (freq + K1 * (1 - B + (B * posting.length) / corpus.avgLength));
    }
    if (score > 0) {
      // Reward pages that cover more of the question, not just one repeated word.
      hits.push({ ...posting.doc, score: score * (0.5 + (0.5 * matched) / unique.length) });
    }
  }
  return hits.sort((a, b) => b.score - a.score);
}

/** Formulary pages for any drug named in the query (CPG only). */
function formularyHits(query: string): PageDoc[] {
  const tokens = new Set(normaliseTokens(query));
  const sorted = [...MEDICATION_ENTRIES].sort((a, b) => a.formularyPage - b.formularyPage);
  const { byPrinted } = getCorpora().cpg;
  const out: PageDoc[] = [];
  sorted.forEach((drug, i) => {
    const nameTokens = normaliseTokens(drug.name);
    if (!nameTokens.some((t) => tokens.has(t) && t.length >= 4)) return;
    const end = (sorted[i + 1]?.formularyPage ?? drug.formularyPage + 3) - 1;
    for (let p = drug.formularyPage; p <= Math.min(end, drug.formularyPage + 3); p++) {
      const doc = byPrinted.get(p);
      if (doc && doc.text.length > 40) out.push(doc);
    }
  });
  return out;
}

export function searchPages(
  query: string,
  options: { types?: DocType[]; limit?: number } = {}
): SearchHit[] {
  const types = options.types ?? ["cpg", "cpm", "sop"];
  const limit = options.limit ?? 8;
  const queryTokens = normaliseTokens(query);
  if (queryTokens.length === 0) return [];

  const all = getCorpora();
  const ranked = types.flatMap((type) => bm25(all[type], queryTokens).slice(0, limit));
  ranked.sort((a, b) => b.score - a.score);

  const best = ranked[0]?.score ?? 0;
  const results: SearchHit[] = [];
  const seen = new Set<string>();
  const push = (hit: SearchHit) => {
    const key = `${hit.type}:${hit.page}`;
    if (seen.has(key) || results.length >= limit) return;
    seen.add(key);
    results.push(hit);
  };

  // Interleave the named drug's formulary pages (most relevant first) with the
  // ranked protocol pages, so neither crowds the other out.
  const cpgScores = types.includes("cpg") ? bm25(all.cpg, queryTokens) : [];
  const scoreOf = (doc: PageDoc) => cpgScores.find((h) => h.page === doc.page)?.score ?? 0;
  const formulary = types.includes("cpg")
    ? formularyHits(query)
        .map((doc) => ({ ...doc, score: scoreOf(doc) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
    : [];
  const relevant = ranked.filter((hit) => hit.score >= best * 0.3);

  for (let i = 0; results.length < limit && (i < formulary.length || i < relevant.length); i++) {
    if (formulary[i]) push(formulary[i]);
    if (relevant[i]) push(relevant[i]);
  }
  return results;
}

/** Fetch specific pages by printed page number. */
export function getPages(type: DocType, printedPages: number[]): PageDoc[] {
  const { byPrinted } = getCorpora()[type];
  return printedPages.map((p) => byPrinted.get(p)).filter((d): d is PageDoc => Boolean(d));
}
