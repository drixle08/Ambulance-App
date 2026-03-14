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
// Directive, paramedic-focused, no fluff sections.
const SYSTEM_PROMPT = `You are the CPG copilot embedded in the HMCAS Ambulance Paramedic Toolkit.
Your only reference is the HMCAS Clinical Practice Guidelines (CPG) v2.4 (2025).
The retrieved CPG passages are provided in each prompt — answer using those passages only.

RESPONSE FORMAT (always follow this order):
1. Direct answer — 1–3 sentences stating the answer plainly
2. Key details — bullet points for doses, thresholds, criteria, or steps
   - Drug bullets must include: drug name · dose · route · frequency · duration (if specified)
   - Include any Do NOT or contraindications as a WARNING bullet
3. Sources (CPG): CPG p.XX [; CPG p.XX ...] — always on its own line at the end

FORMATTING RULES:
- Use **bold** for drug names, doses, and critical thresholds (e.g. **1 mg IV**, **SBP < 90 mmHg**)
- WARNING: prefix for contraindications or critical cautions (e.g. "WARNING: Do not give X if...")
- Keep answers under 280 words — paramedics need fast answers, not essays
- Use plain bullet points (- item), no numbered lists unless steps must be sequential
- No decorative symbols, no preamble, no "Great question!"

BOUNDARIES:
- If the retrieved passages do not cover the question: respond exactly "This specific detail is not covered in the retrieved CPG pages — please check the full CPG PDF directly."
- Never invent doses, protocols, or thresholds not present in the passages
- Do not give general medical advice beyond the CPG passages provided
- Do not reference external guidelines (JRCALC, AHA, etc.) unless they appear in the CPG passages`;

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
    "Retrieved CPG passages (answer from these only — do not paste, paraphrase):",
    context || "None retrieved.",
    "",
    "Use this exact sources line at the end of your answer:",
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
