import { NextRequest, NextResponse } from "next/server";
import { searchSopChunks, type SopChunk } from "@/lib/sopChat/retriever";
import { searchSopEntries } from "@/lib/sopIndex";

export const runtime = "nodejs";

type Source = {
  id: string;
  page: number;
  printedPage: number;
  sopUrl: string;
  label: string;
  code?: string;
};

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_MODEL = "gpt-4o-mini";

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the SOP Assistant embedded in the HMCAS Ambulance Paramedic Toolkit.
Your job: read the retrieved SOP passages and answer operational questions accurately.

CRITICAL RULES:
- Lead with the direct answer on the FIRST line — state the actual procedure, requirement, or action immediately. Do not start with "According to the SOP" or any preamble.
- Quote specific requirements exactly when present (e.g. "within 24 hours", "minimum 3 crew").
- If the passages contain the answer, give it — do not say "please check the SOP" when the answer is right there.
- If the passages genuinely do not contain enough to answer, say: "This is not covered in the retrieved SOP pages — open the SOP PDF to check directly."
- Never invent requirements not present in the retrieved passages.

RESPONSE FORMAT (always follow this order):
1. Direct answer line — one sentence giving the specific answer
2. Key details — bullet points for steps, requirements, timelines, or responsibilities
   - WARNING: prefix for critical requirements or prohibited actions
3. Sources (SOP): SOP X.X p.XX [; SOP X.X p.XX ...] — always the final line

FORMATTING:
- **Bold** key terms, SOP codes, timeframes, and critical requirements
- Keep total response under 280 words
- Plain bullet points only; no decorative symbols; no "Great question!" or similar`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSources(chunks: SopChunk[], query: string): Source[] {
  // Get SOP index entries that match the query for richer labels
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
        sopUrl: `/tools/sop?page=${chunk.printedPage}`,
        label: entry ? `${entry.code} p.${chunk.printedPage}` : `SOP p.${chunk.printedPage}`,
        code: entry?.code,
      };
    });
}

function buildContext(chunks: SopChunk[]): string {
  return chunks
    .map((chunk) => {
      const cleaned = chunk.text.replace(/\s+/g, " ").trim();
      const snippet = cleaned.length > 900 ? `${cleaned.slice(0, 900)}…` : cleaned;
      return `[SOP p.${chunk.printedPage}]: ${snippet}`;
    })
    .join("\n\n");
}

function buildSourceLine(sources: Source[]): string {
  const parts = Array.from(new Set(sources.map((s) => s.label)));
  return parts.length ? `Sources (SOP): ${parts.join("; ")}` : "";
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
    "Retrieved SOP passages — extract exact requirements, steps, and timeframes from these:",
    context || "None retrieved.",
    "",
    "End your answer with this exact sources line:",
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
    console.error("[sop-chat] OpenAI error", resp.status, text);
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

  const topChunks = await searchSopChunks(query, 8);

  if (topChunks.length === 0) {
    return NextResponse.json({
      answer:
        "I can only answer questions covered by the HMCAS SOP. Please ask about operational procedures, policies, responsibilities, or administrative processes.",
      sources: [],
    });
  }

  const sources = buildSources(topChunks, query);
  const sourceLine = buildSourceLine(sources);
  const context = buildContext(topChunks);

  const answer = await callOpenAI(query, context, sourceLine, history);

  const finalAnswer = (() => {
    if (!answer) return null;
    if (answer.toLowerCase().includes("sources (sop")) return answer;
    return sourceLine ? `${answer.trim()}\n\n${sourceLine}` : answer;
  })();

  if (!finalAnswer) {
    const fallback = sourceLine
      ? `Unable to generate a response right now.\n\n${sourceLine}`
      : "Unable to generate a response right now. Please review the SOP PDF directly.";
    return NextResponse.json({ answer: fallback, sources, sourceLine });
  }

  return NextResponse.json({ answer: finalAnswer, sources, sourceLine });
}
