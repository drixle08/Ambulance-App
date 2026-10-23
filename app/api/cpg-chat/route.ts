import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getPages, searchPages, type DocType, type PageDoc } from "@/lib/chat/search";
import { parseChatRequest, type HistoryMessage } from "@/lib/chatGuard";
import { CPG } from "@/lib/cpgEdition";
import { cpgRef } from "@/lib/cpgProvenance";

export const runtime = "nodejs";

type Source = {
  id: string;
  page: number;
  printedPage: number;
  pdfUrl: string;
  label: string;
  type: DocType;
};

const DEFAULT_MODEL = "claude-opus-5-5";
/** Extra search rounds Claude may take before it must answer. */
const MAX_TOOL_ROUNDS = 3;
const INITIAL_PAGES = 8;

const DOC_LABEL: Record<DocType, string> = { cpg: `CPG ${CPG.tag}`, cpm: "CPM v4.0", sop: "SOP v4.4" };

// Formulary page range quoted to the model; page numbers belong to that edition.
const FORMULARY_PAGES = { start: cpgRef("2.6", 295, "FORMULARY Click on the drug name"), end: 400 };

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Clinical Assistant — a senior HMCAS paramedic with deep CPG knowledge, built into the HMCAS Ambulance Paramedic Toolkit. You talk like a knowledgeable colleague on scene: clear, direct, and practical. Not a textbook. Not a robot.

You have access to:
- CPG (Clinical Practice Guidelines ${CPG.tag}, ${CPG.year}) — current HMCAS clinical protocols, with a drug formulary (p.${FORMULARY_PAGES.start.page}–${FORMULARY_PAGES.end}) holding general adult and paediatric dosing tables
- SOP (Standard Operating Procedures v4.4, 2024) — operational and HR procedures
- CPM (Clinical Procedure Manual v4.0, 2024) — clinical procedure and privileging reference

Each question arrives with the pages a search found. Every page is labelled with its document, printed page number and the protocol it belongs to.

FINDING THE ANSWER:
- If the pages provided don't contain what's needed, use search_guidelines with different wording, or read_pages to open a specific page (e.g. the next page of a protocol, a "See CPG 2.7" cross-reference, or the formulary entry for a drug). Do this before saying something isn't covered.
- For drug doses, the CPG for the patient's condition (e.g. CPG 5.1 Asthma for an asthma question) takes priority over the formulary. Find and use the condition CPG's dose, number of doses and repeat interval first. If the condition CPG isn't among the pages you have, search for it before answering.
- Use the formulary for what the condition CPG doesn't state (preparation, dilution, routes, contraindications, precautions), or when the question isn't about a specific condition.
- If the condition CPG and the formulary differ (e.g. number of doses allowed), give the condition CPG's figure and briefly note that the formulary differs, citing both pages.
- Check whether each passage is for adults or paediatrics. Never give a paediatric dose for an adult question, or the reverse.
- Some algorithm/flowchart pages have no extractable text. If the answer probably lives on one of those, say which page to open.

TONE:
- Peer-to-peer. Talk like a senior medic helping a colleague mid-shift, not writing a report.
- Lead straight into the answer. No preamble, no "According to the CPG..."
- Short, punchy sentences. Use "your patient", "you'll want to", "keep in mind".
- Flag critical points clearly. Never sacrifice accuracy for tone.

CLINICAL RULES — non-negotiable:
- Every dose, threshold, and criterion must come verbatim from the pages you were given. Never invent or paraphrase a number.
- Never calculate a patient-specific dose, volume or energy (e.g. mg/kg × weight). Give the per-kg dose as written and point to the toolkit's Drug Calculator. Weight-estimation formulas may be shown, but don't work them through into doses.
- If, after searching, the pages still don't cover it, say: "That's not in the guideline pages I could find — open the PDF and check directly."
- ${CPG.label}, SOP v4.4 (2024) and CPM v4.0 (2024) are the current versions. Do not reference older versions.
- If the question is outside CPG/SOP/CPM scope entirely, say so clearly and don't speculate.

RESPONSE FORMAT:
1. Opening — one or two sentences giving the direct answer in plain language
2. Key details — bullet points covering doses, criteria, timing, steps, cautions
   - Drugs: **name** · exact dose · route · timing · cautions
   - Use **bold** for doses, drug names, thresholds, and critical requirements
   - WARNING: prefix for hard stops, contraindications, or must-not-do actions
3. Closing reference line, e.g. "Full protocol is at CPG 2.1, p.34 — worth a read for the full picture."

CITATIONS: cite the page for every dose or criterion inline, as (CPG p.285), (CPM p.210) or (SOP p.128). Only cite pages you were shown. Do not write a "Sources" line — the app adds it from your citations.

FORMATTING:
- Under 300 words total
- Plain bullets only — no decorative symbols, no emoji except ⚠️ for hard stops
- No filler phrases: no "Great question!", "Certainly!", "Of course!", or similar`;

// ─── Tools ───────────────────────────────────────────────────────────────────

const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "search_guidelines",
    description:
      "Keyword search over the CPG, CPM and SOP. Returns the best-matching pages with their full text. Use different wording or a narrower query if the first results miss (e.g. the drug name plus 'adult cardiac arrest').",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords" },
        source: {
          type: "string",
          enum: ["cpg", "cpm", "sop", "all"],
          description: "Which document to search; 'all' searches every document",
        },
      },
      required: ["query", "source"],
      additionalProperties: false,
    },
  },
  {
    name: "read_pages",
    description:
      "Read specific pages by printed page number, e.g. the continuation of a protocol or a page referenced elsewhere. Maximum 4 pages per call.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        source: { type: "string", enum: ["cpg", "cpm", "sop"] },
        pages: { type: "array", items: { type: "integer" }, description: "Printed page numbers" },
      },
      required: ["source", "pages"],
      additionalProperties: false,
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPages(pages: PageDoc[]): string {
  if (pages.length === 0) return "No matching pages.";
  return pages
    .map((p) => {
      const header = `[${p.type.toUpperCase()} p.${p.printedPage}${p.section ? ` — ${p.section}` : ""}]`;
      const body = p.text.length > 40 ? p.text : "(No extractable text — likely a flowchart or diagram page.)";
      return `${header}\n${body}`;
    })
    .join("\n\n");
}

function toSource(p: PageDoc): Source {
  const pdfPage = p.type === "cpg" ? p.page : p.printedPage;
  const prefix = p.type === "sop" && p.code.startsWith("SOP") ? p.code : DOC_LABEL[p.type];
  return {
    id: `${p.type}-${p.page}`,
    page: p.page,
    printedPage: p.printedPage,
    pdfUrl: `/tools/${p.type}?page=${pdfPage}`,
    label: `${prefix} p.${p.printedPage}`,
    type: p.type,
  };
}

/** Pages cited in the answer, e.g. "(CPG p.285)", "CPG 2.1, p.34", "SOP 4.3 p.128". */
function citedPages(answer: string): Set<string> {
  const cited = new Set<string>();
  const re = /\b(CPG|CPM|SOP)\b[^()\n|;]{0,30}?\bp(?:age|p)?\.?\s?(\d{1,3})(?:\s?[-–]\s?(\d{1,3}))?/gi;
  for (const m of answer.matchAll(re)) {
    const type = m[1].toLowerCase();
    const from = Number(m[2]);
    const to = m[3] ? Math.min(Number(m[3]), from + 5) : from;
    for (let p = from; p <= to; p++) cited.add(`${type}:${p}`);
  }
  return cited;
}

function buildSourceLines(sources: Source[]): string {
  const lines: string[] = [];
  for (const type of ["cpg", "sop", "cpm"] as DocType[]) {
    const labels = [...new Set(sources.filter((s) => s.type === type).map((s) => s.label))];
    if (labels.length) lines.push(`Sources (${type.toUpperCase()}): ${labels.join("; ")}`);
  }
  return lines.join("\n");
}

function runTool(name: string, input: unknown): PageDoc[] {
  const args = (input ?? {}) as { query?: unknown; source?: unknown; pages?: unknown };
  const source = typeof args.source === "string" ? args.source : "all";
  if (name === "search_guidelines" && typeof args.query === "string") {
    const types = source === "all" ? undefined : [source as DocType];
    return searchPages(args.query, { types, limit: 5 });
  }
  if (name === "read_pages" && Array.isArray(args.pages) && source !== "all") {
    const pages = args.pages.filter((p): p is number => Number.isInteger(p)).slice(0, 4);
    return getPages(source as DocType, pages);
  }
  return [];
}

// ─── Claude call ─────────────────────────────────────────────────────────────

let client: Anthropic | null = null;

async function askClaude(
  query: string,
  initialPages: PageDoc[],
  history: HistoryMessage[],
  shown: Map<string, PageDoc>
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic();
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    {
      role: "user",
      content: `Question: ${query}\n\nPages found by search:\n\n${formatPages(initialPages)}`,
    },
  ];

  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const response = await client.beta.messages.create({
        model,
        max_tokens: 16000,
        output_config: { effort: "medium" },
        // On a safety-classifier decline (e.g. toxicology questions), retry on a fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        // Last round: no more searching, answer with what's been found.
        tool_choice: round === MAX_TOOL_ROUNDS ? { type: "none" } : { type: "auto" },
        messages,
      });

      if (response.stop_reason === "refusal") {
        console.warn("[cpg-chat] Claude refusal", response.stop_details?.category);
        return null;
      }

      const toolUses = response.content.filter(
        (b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use"
      );
      if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
        const text = response.content
          .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
          .map((b) => b.text)
          .join("")
          .trim();
        return text || null;
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: toolUses.map((tool) => {
          const pages = runTool(tool.name, tool.input);
          for (const p of pages) shown.set(`${p.type}:${p.printedPage}`, p);
          return { type: "tool_result" as const, tool_use_id: tool.id, content: formatPages(pages) };
        }),
      });
    }
    return null;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error("[cpg-chat] Claude API error", error.status, error.message);
    } else {
      console.error("[cpg-chat] Claude request failed", error);
    }
    return null;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const parsed = await parseChatRequest(req);
  if ("error" in parsed) return parsed.error;
  const { query, history } = parsed;

  const initialPages = searchPages(query, { limit: INITIAL_PAGES });

  if (initialPages.length === 0) {
    return NextResponse.json({
      answer:
        "I can only answer questions covered by the HMCAS CPG, SOP, or CPM. Please ask about a clinical protocol, drug dose, clinical procedure, operational procedure, or administrative policy.",
      sources: [],
    });
  }

  // Every page Claude sees (initial search + its own lookups), keyed "type:printedPage".
  const shown = new Map(initialPages.map((p) => [`${p.type}:${p.printedPage}`, p] as const));
  const answer = await askClaude(query, initialPages, history, shown);

  if (!answer) {
    const sources = initialPages.map(toSource);
    const sourceLine = buildSourceLines(sources);
    return NextResponse.json({
      answer: `Unable to generate a response right now. These pages look most relevant:\n\n${sourceLine}`,
      sources,
      sourceLine,
    });
  }

  // Only list pages that were both cited in the answer and actually shown to Claude.
  const cited = citedPages(answer);
  const citedShown = [...shown.entries()].filter(([key]) => cited.has(key)).map(([, p]) => p);
  const sources = (citedShown.length ? citedShown : initialPages.slice(0, 3)).map(toSource);
  const sourceLine = buildSourceLines(sources);
  const body = answer.replace(/\n*^sources?\s*\((cpg|sop|cpm)\):.*$/gim, "").trim();

  return NextResponse.json({ answer: `${body}\n\n${sourceLine}`, sources, sourceLine });
}
