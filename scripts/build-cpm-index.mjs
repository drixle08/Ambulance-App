// Build public/cpm-index.json: the CPM text the Clinical Assistant searches.
//
// One entry per page, with structure kept (see scripts/lib/pdf-structure.mjs):
// table rows with labelled cells, labelled flowchart columns, line breaks
// between blocks.
//
//   npm run build:cpm-index

import fs from "fs/promises";
import path from "path";
import { openPdf, extractPage } from "./lib/pdf-structure.mjs";

const PDF_FILE = "cpm-v4.0-2024.pdf";
const PDF_PATH = path.join(process.cwd(), "public", "reference", "cpm", PDF_FILE);
const OUTPUT_PATH = path.join(process.cwd(), "public", "cpm-index.json");
// Printed page 1 starts on PDF page 2 (after the cover).
const PRINTED_PAGE_OFFSET = 1;

async function main() {
  const pdf = await openPdf(PDF_PATH);
  console.log(`Loaded CPM PDF with ${pdf.numPages} pages.`);

  const chunks = [];
  const lowCoverage = [];
  const ambiguous = [];
  for (let pageNumber = 2; pageNumber <= pdf.numPages; pageNumber += 1) {
    const { text, plain, coverage, stats } = await extractPage(pdf, pageNumber);
    if (coverage < 0.8) lowCoverage.push(`p.${pageNumber} ${(coverage * 100).toFixed(0)}%`);
    for (const span of stats.ambiguousSpans) ambiguous.push(`p.${pageNumber}: ${span}`);
    if (text) {
      chunks.push({ id: `cpm-page-${pageNumber}`, page: pageNumber, printedPage: pageNumber - PRINTED_PAGE_OFFSET, text, plain });
    }
    if (pageNumber % 50 === 0 || pageNumber === pdf.numPages) console.log(`Processed page ${pageNumber}/${pdf.numPages}`);
  }

  const payload = {
    createdAt: new Date().toISOString(),
    source: PDF_FILE,
    format: "structured-page",
    chunkCount: chunks.length,
    pages: chunks.length,
    printedPageOffset: PRINTED_PAGE_OFFSET,
    chunks,
  };
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${chunks.length} pages to ${OUTPUT_PATH.replace(process.cwd(), ".")}`);
  if (lowCoverage.length) console.log(`Pages where the structure tree reached < 80% of the text (rest kept by position): ${lowCoverage.join(", ")}`);
  if (ambiguous.length) console.log(`Merged-cell carry-downs with no border evidence (${ambiguous.length}):\n  ${ambiguous.join("\n  ")}`);
}

main().catch((err) => {
  console.error("Failed to build CPM index:", err);
  process.exit(1);
});
