import fs from "fs/promises";
import path from "path";

const INDEX_PATH = path.join(process.cwd(), "public", "cpm-index.json");
const OUTPUT_PATH = path.join(process.cwd(), "lib", "cpmIndex.ts");

const SECTION_BY_MAJOR = {
  1: "Patient Assessment",
  2: "Airway Management",
  3: "Oxygenation and Ventilation",
  4: "Circulatory Management",
  5: "Medication Administration",
  6: "Electrocardiogram Recording",
  7: "Cardiac Management",
  8: "Wound Care",
  9: "Spinal Motion Restriction",
  10: "Chest Injuries Management",
  11: "Splinting",
  12: "Obstetrics and Gynecology",
  13: "Paediatrics",
  14: "Lifting and Moving",
  15: "Miscellaneous",
};

function normalizeCode(raw) {
  return raw.replace(/\s+/g, "").replace(/\.+/g, ".");
}

function ascii(text) {
  return text
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E]/g, "");
}

function cleanTitle(title) {
  return ascii(title)
    .replace(/\bS core\b/gi, "Score")
    .replace(/\bmano euvre\b/gi, "manoeuvre")
    .replace(/\bman oeuvre\b/gi, "manoeuvre")
    .replace(/\bL UCAS\b/g, "LUCAS")
    .replace(/\bLIFEPAK15\b/g, "LIFEPAK 15")
    .replace(/\bLIFEPA K\b/g, "LIFEPAK")
    .replace(/\bMod i fied\b/gi, "Modified")
    .replace(/\bwa lking\b/gi, "walking")
    .replace(/\bProlapse d\b/gi, "Prolapsed")
    .replace(/\s*[-]\s*/g, " - ")
    .replace(/\s*:\s*/g, ": ")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

function buildKeywords(entry) {
  const terms = new Set([
    `cpm ${entry.code}`,
    entry.code,
    entry.title.toLowerCase(),
    entry.section.toLowerCase(),
  ]);

  entry.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .forEach((token) => terms.add(token));

  return Array.from(terms);
}

async function main() {
  const raw = await fs.readFile(INDEX_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const entries = [];

  for (const chunk of parsed.chunks ?? []) {
    if (chunk.printedPage < 27) continue;

    const marker = "BACK TO TABLE OF CONTENTS";
    const markerIndex = chunk.text.indexOf(marker);
    const rest = (markerIndex >= 0 ? chunk.text.slice(markerIndex + marker.length) : chunk.text).trim();
    const match = rest.match(
      /^((?:\d\s*){1,2}\.\s*(?:\d\s*){1,2})\s+(.+?)\s+(?:I\s*ndications|Indications|Contraindications|Precautions|Adverse Effects|Standard precautions|Procedure)\b/i
    );

    if (!match) continue;

    const code = normalizeCode(match[1]);
    if (!/^\d+\.\d+$/.test(code) || entries.some((entry) => entry.code === code)) {
      continue;
    }

    const major = Number(code.split(".")[0]);
    const entry = {
      code,
      title: cleanTitle(match[2]),
      section: SECTION_BY_MAJOR[major] ?? "Clinical Procedure Manual",
      printedPage: chunk.printedPage,
    };

    entries.push({
      ...entry,
      keywords: buildKeywords(entry),
    });
  }

  const output = `export type CpmEntry = {
  code: string;
  title: string;
  section: string;
  printedPage: number;
  keywords: string[];
};

export const CPM_ENTRIES: CpmEntry[] = ${JSON.stringify(entries, null, 2)};

export function searchCpmEntries(query: string): CpmEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const numericQuery = Number(q);
  const isNumericQuery = Number.isFinite(numericQuery) && numericQuery > 0;

  return CPM_ENTRIES.filter((entry) => {
    return (
      entry.code.toLowerCase().includes(q) ||
      \`cpm \${entry.code}\`.includes(q) ||
      entry.title.toLowerCase().includes(q) ||
      entry.section.toLowerCase().includes(q) ||
      entry.keywords.some((keyword) => keyword.includes(q)) ||
      (isNumericQuery && entry.printedPage === Math.round(numericQuery))
    );
  }).slice(0, 8);
}
`;

  await fs.writeFile(OUTPUT_PATH, output, "utf8");
  console.log(`Wrote ${entries.length} CPM search entries to ${OUTPUT_PATH.replace(process.cwd(), ".")}`);
}

main().catch((error) => {
  console.error("Failed to build CPM search index:", error);
  process.exit(1);
});
