import fs from "fs/promises";
import path from "path";
import { getDocument } from "pdfjs-dist";

const PDF_PATH = path.join(
  process.cwd(),
  "public",
  "reference",
  "cpg",
  "cpg-v2.4-2025.pdf"
);
const OUTPUT_PATH = path.join(process.cwd(), "public", "cpg-index.json");

const TARGET_CHARS = 1200;
const OVERLAP_CHARS = 200;

const simplifyWhitespace = (text) =>
  text.replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim();

function chunkText(text, pageNumber) {
  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    const end = Math.min(start + TARGET_CHARS, text.length);
    const slice = text.slice(start, end).trim();
    if (slice) {
      chunks.push({
        id: `page-${pageNumber}-chunk-${chunkIndex}`,
        page: pageNumber,
        printedPage: pageNumber,
        text: slice,
      });
      chunkIndex += 1;
    }
    if (end === text.length) break;
    start = Math.max(end - OVERLAP_CHARS, start + TARGET_CHARS);
  }

  return chunks;
}

async function extractChunks() {
  const loadingTask = getDocument({
    url: PDF_PATH,
    verbosity: 0,
  });

  const pdf = await loadingTask.promise;
  console.log(`Loaded PDF with ${pdf.numPages} pages.`);

  const allChunks = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = simplifyWhitespace(
      textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
    );

    if (!pageText) {
      continue;
    }

    const pageChunks = chunkText(pageText, pageNumber);
    allChunks.push(...pageChunks);

    if (pageNumber % 10 === 0 || pageNumber === pdf.numPages) {
      console.log(
        `Processed page ${pageNumber}/${pdf.numPages} (total chunks: ${allChunks.length})`
      );
    }
  }

  return allChunks;
}

async function main() {
  const chunks = await extractChunks();
  const payload = {
    createdAt: new Date().toISOString(),
    source: "cpg-v2.4-2025.pdf",
    chunkCharLength: TARGET_CHARS,
    chunkOverlap: OVERLAP_CHARS,
    chunkCount: chunks.length,
    pages: [...new Set(chunks.map((c) => c.page))].length,
    chunks,
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2), "utf8");
  console.log(
    `Wrote ${chunks.length} chunks to ${OUTPUT_PATH.replace(process.cwd(), ".")}`
  );
}

main().catch((err) => {
  console.error("Failed to build CPG index:", err);
  process.exit(1);
});
