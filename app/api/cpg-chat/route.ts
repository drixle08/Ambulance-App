import { NextRequest, NextResponse } from "next/server";
import { searchCpgChunks, type CpgChunk } from "@/lib/cpgChat/retriever";
import { searchSopChunks, type SopChunk } from "@/lib/sopChat/retriever";
import { searchSopEntries } from "@/lib/sopIndex";

export const runtime = "nodejs";

type Source = {
  id: string;
  page: number;
  printedPage: number;
  pdfUrl: string;
  label: string;
  type: "cpg" | "sop";
};

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_MODEL = "gpt-4o-mini";

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Clinical Assistant embedded in the HMCAS Ambulance Paramedic Toolkit.
You have access to two reference documents:
- CPG (Clinical Practice Guidelines v2.4, 2025): clinical protocols, drug doses, thresholds, transport criteria
- SOP (Standard Operating Procedures v4.4, 2024): operational procedures, HR policies, safety, communications, administration

Your job: read the retrieved passages and give an immediate, specific answer.

CRITICAL RULES:
- Lead with the direct answer on the FIRST line — state the actual dose, threshold, procedure, or action immediately. Do not start with "According to the CPG/SOP" or any preamble.
- For doses and thresholds: quote the exact value from the passage (e.g. "1 mg IV", "SBP < 90 mmHg"). Never paraphrase a number.
- For SOP questions: quote specific requirements exactly (e.g. "within 24 hours", "notify line manager").
- If the passages contain the answer, give it — do not say "please check the CPG/SOP" when the answer is right there.
- If the passages genuinely do not contain enough to answer, say: "This is not covered in the retrieved pages — open the PDF to check directly."
- Never invent values not present in the retrieved passages.

RESPONSE FORMAT (always follow this order):
1. Direct answer line — one sentence giving the specific answer
2. Key details — bullet points for doses, criteria, steps, or requirements
   - Drug bullets: name · exact dose · route · frequency · any cautions
   - WARNING: prefix for Do NOT instructions or critical contraindications/requirements
3. Sources line — always the final line:
   - CPG only: Sources (CPG): CPG p.XX [; CPG p.XX ...]
   - SOP only: Sources (SOP): SOP X.X p.XX [; SOP X.X p.XX ...]
   - Both: Sources (CPG): CPG p.XX | Sources (SOP): SOP X.X p.XX

FORMATTING:
- **Bold** drug names, doses, thresholds, SOP codes, and critical requirements
- Keep total response under 300 words
- Plain bullet points only; no decorative symbols; no "Great question!" or similar`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildCpgSources(chunks: CpgChunk[]): Source[] {
  const seenPages = new Set<number>();
  return chunks
    .filter((chunk) => {
      if (seenPages.has(chunk.printedPage)) return false;
      seenPages.add(chunk.printedPage);
      return true;
    })
    .map((chunk) => ({
      id: chunk.id,
      page: chunk.page,
      printedPage: chunk.printedPage,
      pdfUrl: `/reference/cpg/cpg-v2.4-2025.pdf#page=${chunk.page}`,
      label: `CPG p.${chunk.printedPage}`,
      type: "cpg" as const,
    }));
}

function buildSopSources(chunks: SopChunk[], query: string): Source[] {
  const indexEntries = searchSopEntries(query);
  const entryByPage = new Map(indexEntries.map((e) => [e.printedPage, e]));

  const seenPages = new Set<number>();
  return chunks
    .filter((chunk) => {
      if (seenPages.has(chunk.printedPage)) return false;
      seenPages.add(chunk.printedPage);
      return true;
    })
    .map((chunk) => {
      const entry = entryByPage.get(chunk.printedPage);
      return {
        id: chunk.id,
        page: chunk.page,
        printedPage: chunk.printedPage,
        pdfUrl: `/tools/sop?page=${chunk.printedPage}`,
        label: entry ? `${entry.code} p.${chunk.printedPage}` : `SOP p.${chunk.printedPage}`,
        type: "sop" as const,
      };
    });
}

function buildContext(cpgChunks: CpgChunk[], sopChunks: SopChunk[]): string {
  const cpgParts = cpgChunks.map((chunk) => {
    const cleaned = chunk.text.replace(/\s+/g, " ").trim();
    const snippet = cleaned.length > 900 ? `${cleaned.slice(0, 900)}…` : cleaned;
    return `[CPG p.${chunk.printedPage}]: ${snippet}`;
  });

  const sopParts = sopChunks.map((chunk) => {
    const cleaned = chunk.text.replace(/\s+/g, " ").trim();
    const snippet = cleaned.length > 900 ? `${cleaned.slice(0, 900)}…` : cleaned;
    return `[SOP p.${chunk.printedPage}]: ${snippet}`;
  });

  return [...cpgParts, ...sopParts].join("\n\n");
}

function buildSourceLine(cpgSources: Source[], sopSources: Source[]): string {
  const parts: string[] = [];
  if (cpgSources.length) {
    const labels = Array.from(new Set(cpgSources.map((s) => s.label)));
    parts.push(`Sources (CPG): ${labels.join("; ")}`);
  }
  if (sopSources.length) {
    const labels = Array.from(new Set(sopSources.map((s) => s.label)));
    parts.push(`Sources (SOP): ${labels.join("; ")}`);
  }
  return parts.join(" | ");
}

// ─── OpenAI call ─────────────────────────────────────────────────────────────

async function callOpenAI(
  query: string,
  context: string,
  sourceLine: string,
  history: HistoryMessage[]
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  const userContent = [
    `Question: ${query}`,
    "",
    "Retrieved passages — extract exact values (doses, thresholds, requirements, steps) directly from these:",
    context || "None retrieved.",
    "",
    "End your answer with the sources line:",
    sourceLine || "None",
  ].join("\n");

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.slice(-6).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userContent },
  ];

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 700,
      messages,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    console.error("[cpg-chat] OpenAI error", resp.status, text);
    return null;
  }

  const data = await resp.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? null;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const rawHistory: unknown[] = Array.isArray(body?.history) ? body.history : [];
  const history: HistoryMessage[] = rawHistory
    .filter(
      (m): m is { role: string; content: string } =>
        typeof m === "object" &&
        m !== null &&
        typeof (m as Record<string, unknown>).role === "string" &&
        typeof (m as Record<string, unknown>).content === "string"
    )
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
    .slice(-6);

  // Search both CPG and SOP in parallel
  const [cpgChunks, sopChunks] = await Promise.all([
    searchCpgChunks(query, 6),
    searchSopChunks(query, 4),
  ]);

  if (cpgChunks.length === 0 && sopChunks.length === 0) {
    return NextResponse.json({
      answer:
        "I can only answer questions covered by the HMCAS CPG or SOP. Please ask about a clinical protocol, drug dose, operational procedure, or administrative policy.",
      sources: [],
    });
  }

  const cpgSources = buildCpgSources(cpgChunks);
  const sopSources = buildSopSources(sopChunks, query);
  const allSources = [...cpgSources, ...sopSources];
  const sourceLine = buildSourceLine(cpgSources, sopSources);
  const context = buildContext(cpgChunks, sopChunks);

  const answer = await callOpenAI(query, context, sourceLine, history);

  const finalAnswer = (() => {
    if (!answer) return null;
    const hasSourceLine =
      answer.toLowerCase().includes("sources (cpg)") ||
      answer.toLowerCase().includes("sources (sop)");
    if (hasSourceLine) return answer;
    return sourceLine ? `${answer.trim()}\n\n${sourceLine}` : answer;
  })();

  if (!finalAnswer) {
    const fallback = sourceLine
      ? `Unable to generate a response right now.\n\n${sourceLine}`
      : "Unable to generate a response right now. Please review the CPG or SOP PDF directly.";
    return NextResponse.json({ answer: fallback, sources: allSources, sourceLine });
  }

  return NextResponse.json({ answer: finalAnswer, sources: allSources, sourceLine });
}
