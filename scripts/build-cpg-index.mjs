// Build public/cpg-index.json: the CPG text the Clinical Assistant searches.
//
// One entry per page, with structure kept (see scripts/lib/pdf-structure.mjs):
// table rows with labelled cells, flowchart boxes labelled with their column
// (ADULT, PAEDIATRIC, ...), and line breaks between blocks.
//
//   npm run build:cpg-index

import fs from "fs/promises";
import path from "path";
import { openPdf, extractPage } from "./lib/pdf-structure.mjs";

// Shipped edition comes from the single source of truth, lib/cpgEdition.json.
const CPG_EDITIONS = JSON.parse(
  await fs.readFile(path.join(process.cwd(), "lib", "cpgEdition.json"), "utf8")
);
const PDF_FILE = CPG_EDITIONS.editions[CPG_EDITIONS.current].pdfFile;
const PDF_PATH = path.join(process.cwd(), "public", "reference", "cpg", PDF_FILE);
const OUTPUT_PATH = path.join(process.cwd(), "public", "cpg-index.json");

// Pages where a protocol or a formulary drug starts: a stacked ADULT/PAEDIATRIC
// section never carries over onto these.
async function sectionStartPages() {
  const source = await fs.readFile(path.join(process.cwd(), "lib", "cpgIndex.ts"), "utf8");
  return new Set([...source.matchAll(/\b(?:printedPage|formularyPage):\s*(\d+)/g)].map((m) => Number(m[1])));
}

async function main() {
  const pdf = await openPdf(PDF_PATH);
  const starts = await sectionStartPages();
  console.log(`Loaded PDF with ${pdf.numPages} pages.`);

  const chunks = [];
  const lowCoverage = [];
  const ambiguous = [];
  let state = {};
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    if (starts.has(pageNumber)) state = {};
    const { text, plain, coverage, stats, state: next } = await extractPage(pdf, pageNumber, state);
    state = next;
    if (coverage < 0.8) lowCoverage.push(`p.${pageNumber} ${(coverage * 100).toFixed(0)}%`);
    for (const span of stats.ambiguousSpans) ambiguous.push(`p.${pageNumber}: ${span}`);
    if (text) chunks.push({ id: `page-${pageNumber}`, page: pageNumber, printedPage: pageNumber, text, plain });
    if (pageNumber % 50 === 0 || pageNumber === pdf.numPages) console.log(`Processed page ${pageNumber}/${pdf.numPages}`);
  }

  const payload = {
    createdAt: new Date().toISOString(),
    source: PDF_FILE,
    format: "structured-page",
    chunkCount: chunks.length,
    pages: chunks.length,
    chunks,
  };
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${chunks.length} pages to ${OUTPUT_PATH.replace(process.cwd(), ".")}`);
  if (lowCoverage.length) console.log(`Pages where the structure tree reached < 80% of the text (rest kept by position): ${lowCoverage.join(", ")}`);
  if (ambiguous.length) console.log(`Merged-cell carry-downs with no border evidence (${ambiguous.length}):\n  ${ambiguous.join("\n  ")}`);
}

main().catch((err) => {
  console.error("Failed to build CPG index:", err);
  process.exit(1);
});
