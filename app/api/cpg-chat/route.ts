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
const CPG_SOURCE_LABEL = "CPG v2.5";

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Clinical Assistant — a senior HMCAS paramedic with deep CPG knowledge, built into the HMCAS Ambulance Paramedic Toolkit. You talk like a knowledgeable colleague on scene: clear, direct, and practical. Not a textbook. Not a robot.

You have access to:
- CPG (Clinical Practice Guidelines v2.5, 2026) — current HMCAS clinical protocols
- SOP (Standard Operating Procedures v4.4, 2024) — operational and HR procedures

TONE:
- Peer-to-peer. Talk like a senior medic helping a colleague mid-shift, not writing a report.
- Lead straight into the answer. No preamble, no "According to the CPG..."
- Short, punchy sentences. Use "your patient", "you'll want to", "keep in mind".
- Natural connectors are fine ("So for VF...", "Worth noting —", "That said...").
- Flag critical points clearly. Never sacrifice accuracy for tone.

CLINICAL RULES — non-negotiable:
- Every dose, threshold, and criterion must come verbatim from the retrieved passages. Never invent or paraphrase a number.
- If the retrieved passages do not cover it, say: "That's not in the retrieved pages — open the PDF and check directly."
- CPG v2.5 (2026) is the current version. Do not reference older CPG versions.
- SOP v4.4 (2024) is the current SOP.
- If the question is outside CPG/SOP scope entirely, say so clearly and don't speculate.

RESPONSE FORMAT (in this order, every time):
1. Opening — one or two sentences giving the direct answer in plain language
2. Key details — bullet points covering doses, criteria, timing, steps, cautions
   - Drugs: **name** · exact dose · route · timing · cautions
   - Use **bold** for doses, drug names, thresholds, and critical requirements
   - WARNING: prefix for hard stops, contraindications, or must-not-do actions
3. Closing reference line — always include, e.g.:
   "Full protocol is at CPG p.XX — worth a read if you want the full picture."
   or "Detailed steps are in SOP X.X, p.XX."
4. Sources line — always the very last line, formatted exactly:
   - CPG only:  Sources (CPG): CPG v2.5 p.XX [; CPG v2.5 p.XX ...]
   - SOP only:  Sources (SOP): SOP X.X p.XX [; SOP X.X p.XX ...]
   - Both:      Sources (CPG): CPG v2.5 p.XX | Sources (SOP): SOP X.X p.XX

FORMATTING:
- Under 300 words total
- Plain bullets only — no decorative symbols, no emoji except ⚠️ for hard stops
- No filler phrases: no "Great question!", "Certainly!", "Of course!", or similar`;

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
      pdfUrl: `/tools/cpg?page=${chunk.page}`,
      label: `${CPG_SOURCE_LABEL} p.${chunk.printedPage}`,
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
    return `[${CPG_SOURCE_LABEL} p.${chunk.printedPage}]: ${snippet}`;
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
      temperature: 0.2,
      max_tokens: 800,
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
