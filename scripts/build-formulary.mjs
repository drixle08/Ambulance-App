// Builds lib/formulary.json (the Formulary tool's data) from the shipped CPG.
//
//   npm run build:formulary
//
// Text comes from public/cpg-index.json (the same page text the provenance
// check and the Clinical Assistant use), so every value is the CPG's own
// wording. The index flattens each dose cell onto one line; the PDF is read
// only to put the CPG's line breaks back into dose text, never to change it.
// Drug list and start pages come from MEDICATION_ENTRIES in lib/cpgIndex.ts.
//
// Re-run after a CPG edition change, then review the warnings and the diff.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const warnings = [];
const warn = (msg) => warnings.push(msg);

const editionData = JSON.parse(read("lib/cpgEdition.json"));
const EDITION = editionData.current;
const index = JSON.parse(read("public/cpg-index.json"));
if (index.source !== editionData.editions[EDITION].pdfFile) {
  throw new Error(`cpg-index.json is built from ${index.source}, expected ${editionData.editions[EDITION].pdfFile}`);
}
const pageText = new Map(index.chunks.map((c) => [c.printedPage, c.text]));

// ─── Drug list ───────────────────────────────────────────────────────────────
const cpgIndexSrc = read("lib/cpgIndex.ts");
const meds = [...cpgIndexSrc.matchAll(/\{ name: "([^"]+)", aliases: \[[^\]]*\], formularyPage: (\d+)/g)].map(
  (m) => ({ name: m[1], start: Number(m[2]) }),
);
const appendix = cpgIndexSrc.match(/title: "Retrieval Services Extended Pharmacopoeia", printedPage: (\d+)/);
if (!meds.length || !appendix) throw new Error("Could not read MEDICATION_ENTRIES / formulary end from lib/cpgIndex.ts");
const formularyEnd = Number(appendix[1]) - 1;
meds.forEach((m, i) => (m.end = i + 1 < meds.length ? meds[i + 1].start - 1 : formularyEnd));

// ─── PDF dose-cell lines (for line breaks only) ───────────────────────────────
const DOSE_COLUMN_MIN_X = 245; // dose cells start at x≈258-267; route labels sit at x≈215-228
const pdf = await getDocument({ url: path.join(ROOT, "public/reference/cpg", editionData.editions[EDITION].pdfFile), verbosity: 0 }).promise;
const strip = (s) => s.replace(/\s+/g, "");
const pdfLines = new Map();
async function linesFor(printedPage) {
  if (pdfLines.has(printedPage)) return pdfLines.get(printedPage);
  const page = await pdf.getPage(printedPage); // PDF page index == printed page in this edition
  const { items } = await page.getTextContent();
  const rows = [];
  for (const it of items) {
    const x = it.transform[4];
    const y = it.transform[5];
    if (x < DOSE_COLUMN_MIN_X || !it.str.trim()) continue;
    // 4.5pt: superscripts ("1st") sit 3-4pt above their line; lines are >= 7pt apart
    let row = rows.find((r) => Math.abs(r.y - y) <= 4.5);
    if (!row) rows.push((row = { y, items: [] }));
    row.items.push([x, it.str]);
  }
  const lines = rows
    .sort((a, b) => b.y - a.y)
    .map((r) => strip(r.items.sort((a, b) => a[0] - b[0]).map(([, s]) => s).join("")))
    .filter(Boolean);
  pdfLines.set(printedPage, lines);
  return lines;
}

/**
 * Undo the PDF's soft wraps (a sentence that ran out of cell width), keeping
 * the cell's real lines: join when the next line starts lower-case
 * ("…until clinical condition / improves") or a bracket is still open
 * ("(min 0.1mg; max single dose / 0.5mg)"), the line ends on a function word
 * ("…to a total of / 20ml") or the next line opens a bracket ("30ml/hr / (50mcg/min)").
 */
function joinSoftWraps(s) {
  const out = [];
  for (const line of s.split("\n")) {
    const prev = out.at(-1);
    const openBracket = prev != null && (prev.match(/\(/g) ?? []).length > (prev.match(/\)/g) ?? []).length;
    const danglingWord = prev != null && /\b(of|to|a|an|the|by|and|or|with|into|for|at|in|creating|primary)$/i.test(prev);
    if (prev != null && (/^[a-z(]/.test(line) || openBracket || danglingWord)) out[out.length - 1] = `${prev} ${line}`;
    else out.push(line);
  }
  return out.join("\n");
}

/** Re-insert the PDF's line breaks into a flattened dose string. Text is unchanged apart from whitespace. */
async function withLineBreaks(text, page) {
  const target = strip(text);
  const lines = [...(await linesFor(page)), ...(page + 1 <= formularyEnd ? await linesFor(page + 1) : [])];
  for (let i = 0; i < lines.length; i++) {
    if (!target.startsWith(lines[i])) continue;
    const breaks = [];
    let pos = 0;
    let j = i;
    while (j < lines.length && pos < target.length && target.startsWith(lines[j], pos)) {
      pos += lines[j].length;
      breaks.push(pos);
      j++;
    }
    if (pos !== target.length) continue;
    breaks.pop(); // no break after the last line
    if (!breaks.length) return text;
    let out = "";
    let count = 0;
    let pending = false;
    for (const ch of text) {
      if (/\s/.test(ch)) {
        if (pending) continue;
        out += ch;
        continue;
      }
      if (pending) {
        out = out.replace(/\s+$/, "") + "\n";
        pending = false;
      }
      out += ch;
      count++;
      if (breaks.includes(count)) pending = true;
    }
    return joinSoftWraps(out);
  }
  warn(`p.${page}: no PDF line match for dose text, kept on one line: "${text.slice(0, 70)}…"`);
  return text;
}

// ─── Text helpers ────────────────────────────────────────────────────────────
const clean = (s) => s.replace(/\s+/g, " ").trim();

/** "• A • B o sub o sub • C" → [{text:"A"}, {text:"B", sub:[…]}, {text:"C"}] */
function bullets(s) {
  return s
    .split("•")
    .map(clean)
    .filter(Boolean)
    .map((b) => {
      const [text, ...sub] = b.split(/\s+o\s+(?=[A-Z<>≤≥0-9])/);
      return sub.length ? { text: clean(text), sub: sub.map(clean) } : { text: clean(text) };
    });
}

const NOTE_SEGMENT = /^(max|min|bradycardia max|undiluted|dilut|reconstituted|dextrose 10%|paracetamol syrup|ibuprofen syrup|[\d.]+\s*mg\/[\d.]+\s*ml|follow|not for use)/i;

// ─── Per-drug parse ──────────────────────────────────────────────────────────
const INLINE_BULLET_SECTIONS = { Indications: "indications", Contraindications: "contraindications", Precautions: "precautions", "Side Effects": "sideEffects" };
const BLOCK_SECTIONS = { Class: "class", Action: "action", Metabolism: "metabolism", "Route of Administration": "routes", "Special Notes": "specialNotes" };

async function parseDrug(med) {
  const lines = [];
  for (let p = med.start; p <= med.end; p++) {
    const text = pageText.get(p);
    if (text == null) throw new Error(`No index text for printed page ${p}`);
    for (const raw of text.split("\n")) {
      // PDF navigation links ("▪ BACK TO FORMULARY") occasionally land in the page text
      const line = raw.replace(/▪\s*BACK TO (FORMULARY|TABLE OF CONTENTS)/g, "").trim();
      if (!line || /^\(continued from previous page/.test(line)) continue;
      lines.push({ line, page: p });
    }
  }

  const drug = {
    id: med.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name: med.name,
    cpgTitle: lines[0].line,
    pages: { start: med.start, end: med.end },
    class: "",
    action: "",
    metabolism: "",
    indications: [],
    contraindications: [],
    precautions: [],
    sideEffects: [],
    routes: [],
    specialNotes: [],
    pharmacokinetics: {},
    dosing: { adult: null, paediatric: null, shared: false },
    paediatricTables: [],
  };

  let section = null; // key in drug, or "dosage"
  let population = null; // "adult" | "paediatric" | "both"
  let group = null;
  let table = null;
  let pkHeader = false;

  const startPopulation = (pop) => {
    population = pop;
    group = null;
    table = null;
    const key = pop === "both" ? "adult" : pop;
    drug.dosing[key] ??= [];
  };

  for (const { line, page } of lines.slice(1)) {
    // Inline bullet sections: "Indications • A • B"
    const inline = Object.keys(INLINE_BULLET_SECTIONS).find((h) => line === h || line.startsWith(h + " •"));
    if (inline && section !== "dosage") {
      section = INLINE_BULLET_SECTIONS[inline];
      drug[section].push(...bullets(line.slice(inline.length)));
      continue;
    }
    if (BLOCK_SECTIONS[line] && section !== "dosage") {
      section = BLOCK_SECTIONS[line];
      continue;
    }
    if (line.startsWith("Columns: Onset")) {
      pkHeader = true;
      continue;
    }
    if (pkHeader) {
      pkHeader = false;
      for (const part of line.split(" | ")) {
        const m = part.match(/^(Onset|Duration|Half-life):\s*(.*)$/);
        if (m) drug.pharmacokinetics[{ Onset: "onset", Duration: "duration", "Half-life": "halfLife" }[m[1]]] = clean(m[2]);
        else warn(`${med.name} p.${page}: unrecognised pharmacokinetics part "${part}"`);
      }
      continue;
    }
    const dosageHead = line.match(/^Dosage(?:\s+(ADULT & PAEDIATRIC))?$/);
    if (dosageHead) {
      section = "dosage";
      if (dosageHead[1]) {
        drug.dosing.shared = true;
        startPopulation("both");
      }
      continue;
    }

    if (section === "dosage") {
      if (line === "ADULT" || line === "PAEDIATRIC") {
        startPopulation(line === "ADULT" ? "adult" : "paediatric");
        continue;
      }
      if (/Dosing Table$/.test(line)) {
        table = { title: line, page, header: [], notes: [], rows: [] };
        drug.paediatricTables.push(table);
        continue;
      }
      if (line.startsWith("Columns: ")) {
        const cells = line.slice("Columns: ".length).split(" | ").map(clean);
        if (!table || (table.rows.length && cells[0] === "Age")) {
          // A further table on the same drug without its own title (e.g. Fentanyl RSI)
          const prev = drug.paediatricTables.at(-1);
          const base = prev ? prev.title.replace(/ \(continued\)$/, "") : "Paediatric Dosing Table";
          table = { title: `${base} (continued)`, page, header: [], notes: [], rows: [] };
          drug.paediatricTables.push(table);
        }
        table.header.push(cells);
        continue;
      }
      if (line.startsWith("Age: ")) {
        if (!table) throw new Error(`${med.name} p.${page}: table row before any table`);
        table.rows.push(parseRow(line, table, med.name, page));
        continue;
      }
      if (table) {
        // Free text under a table header (e.g. "Follow dosing on bottle for age groups")
        // or a header note the index wrote as "Group › … › Volume: note".
        if (line.includes(" › ")) {
          for (const part of line.split(" | ")) {
            const segs = part.split(" › ");
            const last = segs.at(-1); // "Volume: Max dose: 10mg" — the note follows the first ": "
            const note = clean(last.slice(last.indexOf(": ") + 2));
            table.groupNotes ??= {};
            const known = (table.groupNotes[clean(segs[0])] ??= []);
            if (note && !known.includes(note)) known.push(note);
          }
        } else table.notes.push({ text: clean(line) });
        continue;
      }
      const bar = line.indexOf(" | ");
      if (bar > 0) {
        if (!group) {
          warn(`${med.name} p.${page}: dose row with no indication heading: "${line.slice(0, 60)}"`);
          group = { indication: "", rows: [] };
          drug.dosing[population === "both" ? "adult" : population].push(group);
        }
        group.rows.push({ route: clean(line.slice(0, bar)), dose: await withLineBreaks(clean(line.slice(bar + 3)), page), page });
        continue;
      }
      if (!population) {
        warn(`${med.name} p.${page}: text in Dosage before ADULT/PAEDIATRIC: "${line}"`);
        continue;
      }
      group = { indication: clean(line), rows: [] };
      drug.dosing[population === "both" ? "adult" : population].push(group);
      continue;
    }

    // Body text of a block section
    switch (section) {
      case "class":
      case "action":
      case "metabolism":
        drug[section] = clean(`${drug[section]} ${line}`);
        break;
      case "routes":
        drug.routes.push(clean(line));
        break;
      case "specialNotes":
        if (line.startsWith("•")) drug.specialNotes.push(...bullets(line));
        else if (drug.specialNotes.length) drug.specialNotes.at(-1).text = clean(`${drug.specialNotes.at(-1).text} ${line}`);
        else drug.specialNotes.push({ text: clean(line) });
        break;
      case "indications":
      case "contraindications":
      case "precautions":
      case "sideEffects":
        if (line.startsWith("•")) drug[section].push(...bullets(line));
        else warn(`${med.name} p.${page}: unbulleted line in ${section}: "${line}"`);
        break;
      default:
        warn(`${med.name} p.${page}: line outside any section: "${line.slice(0, 80)}"`);
    }
  }

  if (drug.dosing.shared) drug.dosing.paediatric = drug.dosing.adult;
  for (const key of ["indications", "contraindications", "routes"]) if (!drug[key].length) warn(`${med.name}: no ${key}`);
  if (!drug.dosing.adult && !drug.dosing.paediatric) warn(`${med.name}: no dosing parsed`);
  for (const pop of ["adult", "paediatric"])
    for (const g of drug.dosing[pop] ?? []) if (!g.rows.length) warn(`${med.name} ${pop}: indication "${g.indication}" has no dose rows`);
  return drug;
}

/** "Age: 1-3 years | Weight: 12-15kg | Group › Dose › Note: value | …" */
function parseRow(line, table, drugName, page) {
  const row = { age: "", weight: "", cells: [] };
  const fullHeaderCells = table.header.flat();
  const expand = (seg) => {
    if (!seg.endsWith("…")) return seg;
    const prefix = seg.slice(0, -1);
    const full = fullHeaderCells.find((c) => c.startsWith(prefix));
    if (!full) warn(`${drugName} p.${page}: could not expand truncated header "${seg}"`);
    return full ?? prefix;
  };
  for (const part of line.split(" | ")) {
    if (part.startsWith("Age: ")) row.age = clean(part.slice(5));
    else if (part.startsWith("Weight: ")) row.weight = clean(part.slice(8));
    else {
      const at = part.lastIndexOf(": ");
      if (at < 0) {
        warn(`${drugName} p.${page}: table cell without a value: "${part}"`);
        continue;
      }
      const segs = part.slice(0, at).split(" › ").map((s) => expand(clean(s)));
      const value = clean(part.slice(at + 2));
      const [group, ...rest] = segs;
      let label = rest.filter((s) => !NOTE_SEGMENT.test(s));
      const notes = rest.filter((s) => NOTE_SEGMENT.test(s));
      // A merged dose+volume cell ("Not indicated in this age group…") carries both headers;
      // a real volume ("0.6ml") keeps its "Volume" label.
      if (label.length > 1 && label.at(-1) === "Volume" && !/\d\s*ml$/i.test(value)) label = label.slice(0, -1);
      row.cells.push({ group, label: label.join(" · "), value });
      table.groupNotes ??= {};
      const known = (table.groupNotes[group] ??= []);
      for (const n of notes) if (!known.includes(n)) known.push(n);
    }
  }
  return row;
}

// ─── Medication privileges (CPG appendix, the two pages after the formulary) ─
// Rows read "Adrenaline IM | Level 4: ✓ | …" on the first page and
// "Paracetamol IV | ✓ | ✓" (header lost) on the second. Checked against the PDF:
// ticks fill from Level 4 downward with no gaps, so n ticks = Levels 4..(5-n).
function parsePrivileges() {
  const start = formularyEnd + 2;
  const out = [];
  for (const p of [start, start + 1]) {
    for (const raw of (pageText.get(p) ?? "").split("\n")) {
      const line = raw.replace(/^MEDICATION: /, "").trim();
      if (!line.includes("✓")) continue;
      const [label, ...cols] = line.split(" | ");
      const levels = cols.some((c) => c.startsWith("Level"))
        ? cols.filter((c) => c.includes("✓")).map((c) => Number(c.match(/Level (\d)/)[1]))
        : cols.filter((c) => c.includes("✓")).map((_, i) => 4 - i);
      out.push({ label: clean(label), levels, page: p });
    }
  }
  if (out.length < 50) warn(`Only ${out.length} medication privilege rows found`);
  return out;
}

const drugs = [];
for (const med of meds) drugs.push(await parseDrug(med));

const privileges = parsePrivileges();
for (const d of drugs) {
  const first = d.name.split(" ")[0].toLowerCase();
  d.privileges = privileges
    .filter((p) => p.label.toLowerCase().startsWith(first))
    .map((p) => ({ route: clean(p.label.slice(p.label.split(" ").slice(0, d.name.split(" ").length).join(" ").length)) || null, levels: p.levels, page: p.page }));
  if (!d.privileges.length) warn(`${d.name}: no medication privilege row`);
}

const out = {
  edition: EDITION,
  source: index.source,
  generatedBy: "scripts/build-formulary.mjs",
  drugs,
};
fs.writeFileSync(path.join(ROOT, "lib/formulary.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`[formulary] ${drugs.length} drugs from ${index.source} (pages ${meds[0].start}-${formularyEnd}) -> lib/formulary.json`);
for (const w of warnings) console.warn(`  ! ${w}`);
