"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  Loader2,
  MessageCircle,
  Send,
  User,
} from "lucide-react";

type SourceDoc = {
  id: string;
  page: number;
  printedPage: number;
  snippet: string;
  pdfUrl: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceDoc[];
};

const EXAMPLES = [
  "What is the stroke transport priority for FAST-positive patients?",
  "Adult asthma: how often can I repeat nebulised salbutamol?",
  "Post-ROSC BP targets and ventilation settings?",
  "Pelvic trauma: when should I apply a pelvic binder?",
];

function Sources({ sources }: { sources: SourceDoc[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
        <BookOpenCheck className="h-4 w-4" />
        Sources (CPG)
      </div>
      <div className="space-y-2">
        {sources.map((source) => (
          <div
            key={source.id}
            className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3"
          >
            <p className="mb-1 text-xs font-semibold text-emerald-300">
              Page {source.printedPage}
            </p>
            <p className="text-[0.8rem] text-slate-200">{source.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CpgChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "I can answer questions using the CPG only. Ask about thresholds, pathways, drug doses, or transport criteria. I'll cite the pages I use and link you to the PDF page.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isSending) return;
    setError(null);
    setInput("");

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const resp = await fetch("/api/cpg-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await resp.json();
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          typeof data?.answer === "string"
            ? data.answer
            : "I could not produce an answer.",
        sources: Array.isArray(data?.sources) ? data.sources : [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setError("Sorry, something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 pb-6 pt-4 text-slate-50">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/reference"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Reference
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
          CPG Chat (beta)
        </span>
      </div>

      <header className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">CPG-grounded Q&A</h1>
            <p className="text-sm text-slate-300">
              Ask questions about the guideline. Answers stay inside the CPG and
              show the pages used. If the model is not configured, you will see
              the top CPG excerpts instead.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => sendMessage(example)}
              className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[12px] font-semibold text-emerald-100 hover:border-emerald-300"
            >
              {example}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex flex-col gap-3 overflow-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {message.role === "user" ? (
                  <>
                    <User className="h-3.5 w-3.5" />
                    You
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-300" />
                    CPG Chat
                  </>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-100">
                {message.content}
              </p>
              {message.sources && message.sources.length > 0 ? (
                <Sources sources={message.sources} />
              ) : null}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-auto space-y-2">
          <div className="flex items-start gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder="Ask a CPG question (e.g., 'When to repeat adrenaline in paediatric arrest?')"
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="flex h-11 w-12 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-md disabled:opacity-60"
              aria-label="Send"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          {error ? (
            <p className="text-xs text-red-300">{error}</p>
          ) : (
            <p className="text-[11px] text-slate-400">
              Answers are grounded in the CPG. Out-of-scope or missing model
              configuration will return excerpts or a refusal.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
