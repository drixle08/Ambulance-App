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

const DEFAULT_MODEL = "gpt-4o-mini";

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

function buildSourceLine(sources: Source[]): string {
  if (sources.length === 0) return "";
  const parts = sources.map((source) => source.label).filter(Boolean);
  const uniqueParts = Array.from(new Set(parts));
  return uniqueParts.length
    ? `Sources (CPG): ${uniqueParts.join("; ")}`
    : "";
}

function buildPrompt(query: string, chunks: CpgChunk[], sources: Source[]) {
  const sourceLine = buildSourceLine(sources);
  const context = chunks
    .map((chunk) => {
      const cleaned = chunk.text.replace(/\s+/g, " ").trim();
      const snippet =
        cleaned.length > 600 ? `${cleaned.slice(0, 600)}...` : cleaned;
      return `Page ${chunk.printedPage}: ${snippet}`;
    })
    .join("\n\n");

  return [
    "You are the AI clinical assistant inside the Ambulance Paramedic Toolkit app. Primary reference: HMCAS Clinical Practice Guidelines (CPG) v2.4 (2025).",
    "Give concise, clinically useful answers for pre-hospital clinicians. Use the retrieved CPG passages as background, but answer in your own words.",
    "Use this structure with plain headings and minimal bullets:",
    "Summary",
    "Immediate Priorities",
    "Assessment",
    "Management / Treatment",
    "Transport & Handover",
    "Notes / Limitations",
    "Style: clean, professional, no decorative symbols or heavy markdown. Short paragraphs; bullets only when needed (especially for meds with dose/route/frequency/cautions, include Do NOT if present).",
    "Do not paste long blocks of guideline text. If the CPG does not clearly support a detail, say so and avoid inventing local policy.",
    'Finish with one compact sources line, e.g., "Sources (CPG): CPG p.80; CPG p.81". Do not include source excerpts.',
    "",
    `Question: ${query}`,
    "",
    "Context from CPG (paraphrase; do not paste):",
    context || "None",
    "",
    "Use the following for the sources line:",
    sourceLine || "None",
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
            "You are the AI clinical assistant in the Ambulance Paramedic Toolkit for HMCAS crews. Primary reference: HMCAS CPG v2.4 (2025). Provide concise, clinically useful answers using the retrieved CPG content as background, but answer in your own words. Use the headings: Summary; Immediate Priorities; Assessment; Management / Treatment; Transport & Handover; Notes / Limitations. Keep formatting plain (no decorative symbols), use short paragraphs and bullets only where helpful (especially for drugs with dose/route/frequency/cautions and any Do NOT guidance). Do not paste long guideline text. If details are unclear or absent, say so without inventing policy. End every answer with a single compact sources line like \"Sources (CPG): CPG p.80; CPG p.81\" and do not include source excerpts. Never include identifying information.",
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
    data?.choices?.[0]?.message?.content?.trim() ?? null;
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
  const sourceLine = buildSourceLine(sources);
  const prompt = buildPrompt(query, topChunks, sources);
  const answer = await callOpenAI(prompt);

  const finalAnswer =
    sourceLine && answer && !answer.toLowerCase().includes("sources (cpg")
      ? `${answer.trim()}\n\n${sourceLine}`
      : answer;

  if (!finalAnswer) {
    const fallbackAnswer = sourceLine
      ? `I could not generate an answer right now. ${sourceLine}`
      : "I could not generate an answer right now. Please review the relevant CPG pages in the PDF.";

    return NextResponse.json({
      answer: fallbackAnswer,
      sources,
      sourceLine,
    });
  }

  return NextResponse.json({
    answer: finalAnswer,
    sources,
    sourceLine,
  });
}
