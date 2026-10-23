// CPG provenance check — turns a CPG edition bump into a re-verification list.
//
//   npm run cpg:reverify
//
// Scans app/, lib/ and scripts/ for the markers from lib/cpgProvenance.ts and
// lib/cpgEdition.ts:
//   cpgEdition("x.y")              content/label checked against edition x.y
//   cpgRef("x.y", page, "quote")   value stated on that printed page
//   cpgAbsent("x.y", "what"[, "regex"])  value deliberately not in the CPG
// and reports:
//   - every marker pinned to an edition other than the current one (to re-verify)
//   - current-edition quotes not found on their cited page of the shipped PDF
//   - current-edition absence claims whose pattern does appear in the PDF
//   - hard-coded "v2.x" / "cpg-v…" strings outside lib/cpgEdition.*
//   - a search index (public/cpg-index.json) built from a different PDF
// Page text comes from public/cpg-index.json (rebuild with npm run build:cpg-index).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = ["app", "lib", "scripts"];
const EXTENSIONS = new Set([".ts", ".tsx", ".mjs", ".js"]);
// Files allowed to spell out an edition: the edition config itself and this checker.
const LITERAL_ALLOWED = new Set(["lib/cpgEdition.json", "lib/cpgEdition.ts", "scripts/cpg-provenance.mjs"]);
// Lines carrying this marker may mention an edition literally (deliberate historical notes).
const HISTORY_MARKER = "cpg-history:";

const STR = String.raw`"((?:[^"\\]|\\.)*)"`;
const RE_EDITION = new RegExp(String.raw`\bcpgEdition\(\s*"([0-9.]+)"\s*\)`, "g");
const RE_REF = new RegExp(String.raw`\bcpgRef\(\s*"([0-9.]+)"\s*,\s*(\d+)\s*,\s*` + STR + String.raw`\s*,?\s*\)`, "g");
const RE_ABSENT = new RegExp(
  String.raw`\bcpgAbsent\(\s*"([0-9.]+)"\s*,\s*` + STR + String.raw`(?:\s*,\s*` + STR + String.raw`)?\s*,?\s*\)`,
  "g"
);
const RE_ANY_CALL = /\b(cpgEdition|cpgRef|cpgAbsent)\(/g;
const RE_LITERAL = /\bv2\.\d\b|cpg-v\d/;

const unescape = (s) => JSON.parse(`"${s}"`);
const normalise = (s) => s.toLowerCase().replace(/\s+/g, "");

export function loadEditionConfig() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "lib/cpgEdition.json"), "utf8"));
}

function listSourceFiles() {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = path.posix.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "__tests__") continue;
        walk(rel);
      } else if (EXTENSIONS.has(path.extname(entry.name)) && !/\.(test|spec)\./.test(entry.name)) {
        out.push(rel);
      }
    }
  };
  SCAN_DIRS.forEach(walk);
  return out;
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

/** All provenance markers in the source tree. */
export function scanMarkers() {
  const markers = [];
  const unparsed = [];
  for (const file of listSourceFiles()) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    const parsedAt = new Set();
    for (const m of text.matchAll(RE_EDITION)) {
      parsedAt.add(m.index);
      markers.push({ kind: "edition", v: m[1], file, line: lineOf(text, m.index) });
    }
    for (const m of text.matchAll(RE_REF)) {
      parsedAt.add(m.index);
      markers.push({ kind: "ref", v: m[1], page: Number(m[2]), quote: unescape(m[3]), file, line: lineOf(text, m.index) });
    }
    for (const m of text.matchAll(RE_ABSENT)) {
      parsedAt.add(m.index);
      markers.push({
        kind: "absent", v: m[1], what: unescape(m[2]), pattern: m[3] === undefined ? undefined : unescape(m[3]),
        file, line: lineOf(text, m.index),
      });
    }
    // Calls the scanner can't read (non-literal arguments). Skips the definitions,
    // mentions in comments, and the edition module itself (which builds the
    // shipped edition from CPG_VERSION on purpose).
    if (LITERAL_ALLOWED.has(file)) continue;
    for (const m of text.matchAll(RE_ANY_CALL)) {
      const before = text.slice(Math.max(0, m.index - 9), m.index);
      const lineText = text.slice(text.lastIndexOf("\n", m.index) + 1, m.index).trimStart();
      if (parsedAt.has(m.index) || /function\s$/.test(before) || /^(\/\/|\*|\/\*)/.test(lineText)) continue;
      unparsed.push({ file, line: lineOf(text, m.index), call: m[1] });
    }
  }
  return { markers, unparsed };
}

/** Hard-coded edition strings outside the edition config. */
export function scanLiterals() {
  const hits = [];
  for (const file of listSourceFiles()) {
    if (LITERAL_ALLOWED.has(file)) continue;
    const lines = fs.readFileSync(path.join(ROOT, file), "utf8").split("\n");
    lines.forEach((text, i) => {
      if (RE_LITERAL.test(text) && !text.includes(HISTORY_MARKER)) hits.push({ file, line: i + 1, text: text.trim() });
    });
  }
  return hits;
}

/** Printed-page text of the shipped PDF, from the search index. */
export function loadPageText() {
  const index = JSON.parse(fs.readFileSync(path.join(ROOT, "public/cpg-index.json"), "utf8"));
  const pages = new Map();
  for (const chunk of index.chunks) {
    const page = chunk.printedPage ?? chunk.page;
    pages.set(page, (pages.get(page) ?? "") + " " + chunk.text);
  }
  return { source: index.source, pages };
}

/** Whitespace- and case-insensitive: PDF text extraction splits words ("SpO 2", "6 00mg"). */
export function quoteOnPage(pages, page, quote) {
  const text = pages.get(page);
  return Boolean(text) && normalise(text).includes(normalise(quote));
}

/** `options.current` simulates a different shipped edition (e.g. to preview a bump). */
export function checkProvenance(options = {}) {
  const config = loadEditionConfig();
  const current = options.current ?? config.current;
  const shipped = config.editions[current];
  const { markers, unparsed } = scanMarkers();
  const literals = scanLiterals();
  const problems = { stale: [], quotes: [], absences: [], literals, unparsed, setup: [] };

  const { source, pages } = loadPageText();
  if (!shipped) {
    problems.setup.push(`Edition ${current} is not listed in lib/cpgEdition.json — add it (year, pdfFile) first`);
  } else {
    if (!fs.existsSync(path.join(ROOT, "public/reference/cpg", shipped.pdfFile))) {
      problems.setup.push(`Shipped PDF missing: public/reference/cpg/${shipped.pdfFile}`);
    }
    if (source !== shipped.pdfFile) {
      problems.setup.push(`public/cpg-index.json was built from ${source}, not ${shipped.pdfFile} — run npm run build:cpg-index`);
    }
  }
  for (const m of markers) {
    if (!(m.v in config.editions)) problems.setup.push(`${m.file}:${m.line} unknown edition "${m.v}"`);
  }

  const allText = [...pages.values()].join(" ");
  for (const m of markers) {
    if (m.v !== current) {
      problems.stale.push(m);
      continue;
    }
    if (m.kind === "ref") {
      if (!quoteOnPage(pages, m.page, m.quote)) problems.quotes.push(m);
    } else if (m.kind === "absent" && m.pattern) {
      if (new RegExp(m.pattern, "i").test(allText.replace(/\s+/g, " "))) problems.absences.push(m);
    }
  }
  return { current, markers, problems };
}

function describe(m) {
  if (m.kind === "edition") return `content checked against v${m.v}`;
  if (m.kind === "ref") return `v${m.v} p.${m.page}: "${m.quote}"`;
  return `v${m.v} not in CPG: ${m.what}`;
}

export function formatReport({ current, markers, problems }) {
  const lines = [`CPG provenance — shipped edition v${current}; ${markers.length} markers scanned.`];
  const section = (title, items, fmt) => {
    if (!items.length) return;
    lines.push("", `${title} (${items.length}):`);
    items.forEach((x) => lines.push(`  ${fmt(x)}`));
  };
  section("Setup problems", problems.setup, (s) => s);
  section(`Re-verify against v${current} — checked against a different edition`, problems.stale, (m) => `${m.file}:${m.line}  ${describe(m)}`);
  section("Quote not found on the cited page", problems.quotes, (m) => `${m.file}:${m.line}  p.${m.page}: "${m.quote}"`);
  section("Claimed absent, but found in the CPG", problems.absences, (m) => `${m.file}:${m.line}  ${m.what} /${m.pattern}/`);
  section("Hard-coded edition strings (use lib/cpgEdition)", problems.literals, (h) => `${h.file}:${h.line}  ${h.text}`);
  section("Markers with non-literal arguments (scanner can't read them)", problems.unparsed, (u) => `${u.file}:${u.line}  ${u.call}(…)`);
  const total = Object.values(problems).reduce((n, list) => n + list.length, 0);
  lines.push("", total ? `${total} item(s) need attention.` : "All markers verified against the shipped edition.");
  return lines.join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // `--as 2.7` previews what a bump to that edition would require.
  const asIndex = process.argv.indexOf("--as");
  const result = checkProvenance(asIndex > 0 ? { current: process.argv[asIndex + 1] } : {});
  console.log(formatReport(result));
  const total = Object.values(result.problems).reduce((n, list) => n + list.length, 0);
  process.exit(total ? 1 : 0);
}
