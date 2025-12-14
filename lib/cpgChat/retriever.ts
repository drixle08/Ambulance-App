import fs from "fs/promises";
import path from "path";

export type CpgChunk = {
  id: string;
  page: number;
  printedPage: number;
  text: string;
};

type CpgIndexFile = {
  chunks: CpgChunk[];
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "or",
  "of",
  "to",
  "in",
  "for",
  "on",
  "with",
  "a",
  "an",
  "at",
  "by",
  "as",
  "be",
  "is",
  "are",
  "was",
  "were",
  "from",
  "that",
  "this",
  "it",
  "can",
  "may",
  "if",
  "per",
  "up",
  "down",
]);

let cachedChunks: CpgChunk[] | null = null;

function tokensFromQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (token) =>
        token.length > 2 && !STOP_WORDS.has(token) && Number.isNaN(Number(token))
    );
}

async function loadChunks(): Promise<CpgChunk[]> {
  if (cachedChunks) return cachedChunks;
  const filePath = path.join(process.cwd(), "public", "cpg-index.json");
  const raw = await fs.readFile(filePath, "utf8");
  const parsed: CpgIndexFile = JSON.parse(raw);
  cachedChunks = parsed.chunks || [];
  return cachedChunks;
}

function scoreChunk(chunk: CpgChunk, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const text = chunk.text.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (!token) continue;
    if (text.includes(token)) {
      const lengthBoost = token.length >= 6 ? 1.2 : 1;
      const occurrences = text.split(token).length - 1;
      score += occurrences * lengthBoost;
    }
  }

  const coverage =
    tokens.filter((token) => text.includes(token)).length / tokens.length;
  score += coverage * 0.5;

  return score;
}

export async function searchCpgChunks(query: string, topK = 6) {
  const tokens = tokensFromQuery(query);
  const chunks = await loadChunks();

  const scored = chunks
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, tokens),
    }))
    .filter((item) => item.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map((item) => item.chunk);
}
