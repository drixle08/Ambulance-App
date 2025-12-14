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
    "You are a paramedic assistant. Answer using ONLY the provided CPG excerpts.",
    "If the excerpts do not answer the question, say you are not sure and ask for a CPG-relevant question.",
    "Do not invent information outside the excerpts. Avoid patient-specific advice.",
    "Cite the page numbers you used (e.g., 'Page 58').",
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
            "You are a concise paramedic assistant. Answer strictly from the provided CPG excerpts. If unsure, say you are not sure. Cite page numbers. Never include identifying info.",
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
    const fallback = [
      "AI answers are disabled. Add OPENAI_API_KEY to enable responses.",
      "Showing the most relevant CPG excerpts instead:",
    ].join("\n");

    return NextResponse.json({
      answer: fallback,
      sources,
    });
  }

  return NextResponse.json({
    answer,
    sources,
  });
}
