import { NextRequest, NextResponse } from "next/server";
import { searchCpgChunks, type CpgChunk } from "@/lib/cpgChat/retriever";

export const runtime = "nodejs";

type Source = {
  id: string;
  page: number;
  printedPage: number;
  snippet: string;
  pdfUrl: string;
};

const DEFAULT_MODEL = "gpt-4o-mini";

function buildSources(chunks: CpgChunk[]): Source[] {
  return chunks.map((chunk) => ({
    id: chunk.id,
    page: chunk.page,
    printedPage: chunk.printedPage,
    snippet:
      chunk.text.length > 500
        ? `${chunk.text.slice(0, 500)}...`
        : chunk.text,
    pdfUrl: `/reference/cpg/cpg-v2.4-2025.pdf#page=${chunk.page}`,
  }));
}

function buildPrompt(query: string, sources: Source[]): string {
  const sourceText = sources
    .map(
      (source) =>
        `Page ${source.printedPage}: ${source.snippet.replace(/\s+/g, " ")}`
    )
    .join("\n\n");

  return [
    "You are the AI clinical assistant inside the “Ambulance Paramedic Toolkit” app for HMCAS (Qatar) pre-hospital crews. Primary reference: HMCAS CPG v2.4 (2025). Use ONLY the provided excerpts; do not invent details.",
    "Your job: convert retrieved CPG lines into clear, concise, actionable guidance. Do NOT dump raw text.",
    "",
    "Default answer structure:",
    "- Brief Summary (1–3 sentences): what the issue is and what you will cover.",
    "- Immediate Priorities / Primary Approach: ordered bullets (ABC, time-critical checks, when to escalate/pre-alert).",
    "- Assessment: bullets for key history/exam/monitoring/decision tools (summarise usage; don’t paste tables).",
    "- Management / Treatment:",
    "  - Non-pharm bullets.",
    "  - Medications bullets: drug, indication, dose (adult/paeds if present), route, frequency/max, cautions. Include “Do NOT” bullets if present.",
    "- Transport & Handover: urgency, destination/bypass, pre-alerts, key handover points if stated.",
    "- Notes / Limitations: call out missing info/assumptions/ambiguity; remind this is decision support.",
    "",
    "Style rules:",
    "- Paraphrase; avoid long quotes. Be action-oriented and ordered. Highlight numbers/thresholds if present.",
    "- Keep concise and scannable (mobile). Use bullets for steps/meds/red flags.",
    "- If excerpts don’t answer, say you are not sure and ask for a CPG-relevant question.",
    "- Do not invent local policy. Use general medical knowledge only to clarify, never to contradict the CPG.",
    "- Only quote briefly if wording is critical. End sentences/bullets with page citations when citing facts (e.g., '(Page 58)').",
    "",
    `Question: ${query}`,
    "",
    "Relevant CPG excerpts:",
    sourceText || "None",
  ].join("\n");
}

async function callOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are the AI clinical assistant in the Ambulance Paramedic Toolkit for HMCAS crews. Base answers ONLY on provided CPG v2.4 (2025) excerpts. Summarize, don’t dump text. Use the required structure: brief summary; immediate priorities; assessment; management (non-pharm, meds with dose/route/frequency/cautions, Do NOT if stated); transport/handover; notes/limitations. Paraphrase, be action-oriented, mobile-friendly, and cite pages inline. If not covered or unclear, say so rather than inventing policy. Never include identifying info.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    console.error("[cpg-chat] OpenAI error", resp.status, text);
    return null;
  }

  const data = await resp.json();
  const answer =
    data?.choices?.[0]?.message?.content?.trim() ??
    "I could not generate an answer right now.";
  return answer;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json(
      { error: "Missing query" },
      {
        status: 400,
      }
    );
  }

  const topChunks = await searchCpgChunks(query, 6);

  if (topChunks.length === 0) {
    return NextResponse.json({
      answer:
        "I can only answer questions covered in the CPG. Please ask about a protocol, threshold, dose, or pathway from the guideline.",
      sources: [],
    });
  }

  const sources = buildSources(topChunks);
  const prompt = buildPrompt(query, sources);
  const answer = await callOpenAI(prompt);

  if (!answer) {
    const topSnippets = sources.slice(0, 2);
    const fallbackAnswer =
      topSnippets.length > 0
        ? topSnippets
            .map(
              (s) =>
                `Page ${s.printedPage}: ${s.snippet.replace(/\s+/g, " ").trim()}`
            )
            .join("\n\n")
        : "No CPG excerpts available.";

    return NextResponse.json({
      answer: fallbackAnswer,
      sources,
    });
  }

  return NextResponse.json({
    answer,
    sources,
  });
}
