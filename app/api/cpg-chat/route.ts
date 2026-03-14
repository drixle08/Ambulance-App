import { NextRequest, NextResponse } from "next/server";
import { searchCpgChunks, type CpgChunk } from "@/lib/cpgChat/retriever";

export const runtime = "nodejs";

type Source = {
  id: string;
  page: number;
  printedPage: number;
  pdfUrl: string;
  label: string;
};

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_MODEL = "gpt-4o-mini";

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the CPG copilot embedded in the HMCAS Ambulance Paramedic Toolkit.
Your job: read the retrieved CPG passages and give an immediate, specific clinical answer.

CRITICAL RULES:
- Lead with the direct clinical answer on the FIRST line — state the actual dose, threshold, or action immediately. Do not start with "According to the CPG" or any preamble.
- For doses and thresholds: quote the exact value from the passage (e.g. "1 mg IV", "SBP < 90 mmHg"). Never paraphrase a number.
- If the passages contain the answer, give it — do not say "please check the CPG" when the answer is right there in the context.
- If the passages genuinely do not contain enough to answer, say: "This is not covered in the retrieved CPG pages — open the PDF to check directly."
- Never invent values not present in the retrieved passages.

RESPONSE FORMAT (always follow this order):
1. Direct answer line — one sentence giving the specific answer (e.g. "**Adrenaline: 1 mg IV every 3–5 minutes** in adult cardiac arrest.")
2. Key details — bullet points for doses, criteria, steps, or contraindications
   - Drug bullets: name · exact dose · route · frequency · any cautions
   - WARNING: prefix for Do NOT instructions or critical contraindications
3. Sources (CPG): CPG p.XX [; CPG p.XX ...] — always the final line

FORMATTING:
- **Bold** drug names, doses, thresholds (e.g. **adrenaline**, **1 mg**, **SBP ≥ 90**)
- Keep total response under 280 words
- Plain bullet points only; no decorative symbols; no "Great question!" or similar`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSources(chunks: CpgChunk[]): Source[] {
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
    }));
}

function buildContext(chunks: CpgChunk[]): string {
  return chunks
    .map((chunk) => {
      const cleaned = chunk.text.replace(/\s+/g, " ").trim();
      // Increased from 600 → 900 chars per chunk for richer context
      const snippet = cleaned.length > 900 ? `${cleaned.slice(0, 900)}…` : cleaned;
      return `[CPG p.${chunk.printedPage}]: ${snippet}`;
    })
    .join("\n\n");
}

function buildSourceLine(sources: Source[]): string {
  const parts = Array.from(new Set(sources.map((s) => s.label)));
  return parts.length ? `Sources (CPG): ${parts.join("; ")}` : "";
}

// ─── OpenAI call with multi-turn history ─────────────────────────────────────

async function callOpenAI(
  query: string,
  context: string,
  sourceLine: string,
  history: HistoryMessage[]
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  // Build the user message for this turn, including retrieved context
  const userContent = [
    `Question: ${query}`,
    "",
    "Retrieved CPG passages — extract exact values (doses, thresholds, criteria) directly from these:",
    context || "None retrieved.",
    "",
    "End your answer with this exact sources line:",
    sourceLine || "None",
  ].join("\n");

  // Compose messages: system + trimmed history + current user turn
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    // Include prior turns for conversational follow-ups (max 3 exchanges = 6 messages)
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
      temperature: 0.1,        // Low temp for factual CPG answers
      max_tokens: 700,          // Raised from 400 → 700 for complete answers
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

  // Validate and sanitise history
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
    .slice(-6); // Keep last 3 exchanges max

  // Retrieve — increased from 6 → 8 chunks for broader coverage
  const topChunks = await searchCpgChunks(query, 8);

  if (topChunks.length === 0) {
    return NextResponse.json({
      answer:
        "I can only answer questions covered by the CPG. Please ask about a protocol, dose, threshold, or clinical pathway from the HMCAS guidelines.",
      sources: [],
    });
  }

  const sources = buildSources(topChunks);
  const sourceLine = buildSourceLine(sources);
  const context = buildContext(topChunks);

  const answer = await callOpenAI(query, context, sourceLine, history);

  // Ensure sources line is always appended if missing from model output
  const finalAnswer = (() => {
    if (!answer) return null;
    if (answer.toLowerCase().includes("sources (cpg")) return answer;
    return sourceLine ? `${answer.trim()}\n\n${sourceLine}` : answer;
  })();

  if (!finalAnswer) {
    const fallback = sourceLine
      ? `Unable to generate a response right now.\n\n${sourceLine}`
      : "Unable to generate a response right now. Please review the CPG PDF directly.";
    return NextResponse.json({ answer: fallback, sources, sourceLine });
  }

  return NextResponse.json({ answer: finalAnswer, sources, sourceLine });
}
