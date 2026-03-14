"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Share2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

type SourceDoc = {
  id: string;
  page: number;
  printedPage: number;
  pdfUrl: string;
  label: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceDoc[];
};

// ─── Example prompts ─────────────────────────────────────────────────────────

const EXAMPLES = [
  "Adrenaline dose in adult cardiac arrest?",
  "When to apply a pelvic binder?",
  "Post-ROSC BP targets and ventilation?",
  "Paediatric asthma — salbutamol dose by weight?",
  "When to bypass to a trauma centre?",
  "TBI MAP targets pre-hospital?",
];

// ─── Response renderer ───────────────────────────────────────────────────────

function inlineBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-slate-100 font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function ResponseRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let keyIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      nodes.push(<div key={keyIdx++} className="h-1.5" />);
      continue;
    }

    // Sources line
    if (/^sources?\s*\(cpg\)/i.test(trimmed)) {
      nodes.push(
        <div key={keyIdx++} className="mt-3 pt-2 border-t border-slate-700/60 flex items-start gap-1.5">
          <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
          <span className="text-xs text-emerald-400">{trimmed}</span>
        </div>
      );
      continue;
    }

    // WARNING / CAUTION line
    if (/^(warning|caution|do not)[:\s]/i.test(trimmed)) {
      nodes.push(
        <div key={keyIdx++} className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2 my-1">
          <span className="text-[0.65rem] font-black uppercase tracking-widest text-rose-400 mt-0.5 shrink-0">!</span>
          <p className="text-sm text-rose-300">{inlineBold(trimmed)}</p>
        </div>
      );
      continue;
    }

    // Bullet line
    if (/^[-•]\s/.test(trimmed)) {
      nodes.push(
        <div key={keyIdx++} className="flex gap-2 items-start">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/70" />
          <p className="text-sm text-slate-200 leading-relaxed">{inlineBold(trimmed.slice(2))}</p>
        </div>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.+)$/);
      if (match) {
        nodes.push(
          <div key={keyIdx++} className="flex gap-2 items-start">
            <span className="mt-0.5 text-xs font-bold text-emerald-400 w-5 shrink-0">{match[1]}.</span>
            <p className="text-sm text-slate-200 leading-relaxed">{inlineBold(match[2])}</p>
          </div>
        );
        continue;
      }
    }

    // Section heading — ALL CAPS or Title Case short line ending with optional colon
    const isHeading =
      (trimmed === trimmed.toUpperCase() && trimmed.length < 50 && /[A-Z]/.test(trimmed)) ||
      (/^[A-Z][A-Za-z\s\/&]+:?\s*$/.test(trimmed) && trimmed.length < 50);

    if (isHeading) {
      nodes.push(
        <p key={keyIdx++} className="text-[0.7rem] font-black uppercase tracking-widest text-emerald-400 mt-3 first:mt-0">
          {trimmed.replace(/:$/, "")}
        </p>
      );
      continue;
    }

    // Default paragraph
    nodes.push(
      <p key={keyIdx++} className="text-sm text-slate-200 leading-relaxed">
        {inlineBold(trimmed)}
      </p>
    );
  }

  return <div className="space-y-1">{nodes}</div>;
}

// ─── Sources chips ────────────────────────────────────────────────────────────

function SourceChips({ sources }: { sources: SourceDoc[] }) {
  if (!sources.length) return null;

  const deduped = Array.from(
    new Map(sources.map((s) => [s.label, s])).values()
  );

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {deduped.map((s) => (
        <a
          key={s.label}
          href={s.pdfUrl || undefined}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[0.65rem] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
        >
          <BookOpen className="w-3 h-3" />
          {s.label}
        </a>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CpgChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, [input]);

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleCopy = async (msg: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Copy failed — please try manually.");
    }
  };

  const handleShare = async (msg: ChatMessage) => {
    if (!canShare) return;
    try {
      await navigator.share({ title: "CPG Chat", text: msg.content });
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError("Share failed.");
    }
  };

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

    // Build history for multi-turn context (last 6 messages)
    const history = [...messages, userMsg]
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch("/api/cpg-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, history }),
      });

      const data = await resp.json();

      const sources: SourceDoc[] = Array.isArray(data?.sources)
        ? data.sources.map((s: { id?: unknown; page?: unknown; printedPage?: unknown; pdfUrl?: unknown; label?: unknown }) => ({
            id: String(s?.id ?? crypto.randomUUID()),
            page: Number(s?.page ?? 0),
            printedPage: Number(s?.printedPage ?? 0),
            pdfUrl: typeof s?.pdfUrl === "string" ? s.pdfUrl : "",
            label: typeof s?.label === "string" ? s.label : "CPG",
          }))
        : [];

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          typeof data?.answer === "string" ? data.answer : "No answer could be generated.",
        sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setError("Connection error — please check your network and try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
              <MessageCircle className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-emerald-400 leading-none">Reference</p>
              <h1 className="text-sm font-bold text-slate-100 leading-tight">CPG Chat</h1>
            </div>
          </div>
          {!isEmpty && (
            <button
              type="button"
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New chat
            </button>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-4 pb-48">

        {/* Empty state */}
        {isEmpty && (
          <div className="pt-6 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <MessageCircle className="w-4.5 h-4.5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-100">HMCAS CPG Assistant</p>
                  <p className="text-[0.65rem] text-slate-500">Answers grounded in CPG v2.4 (2025)</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Ask about drug doses, thresholds, clinical pathways, transport criteria, or
                protocol steps. Answers are based only on the retrieved CPG content and
                include source page references.
              </p>
            </div>

            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-600 mb-3">Try asking</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => sendMessage(ex)}
                    className="text-left rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-slate-300 hover:border-emerald-500/50 hover:text-slate-100 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {msg.role === "user" ? (
              /* User bubble */
              <div className="max-w-[85%] space-y-1">
                <div className="flex items-center justify-end gap-1.5 mb-1">
                  <span className="text-[0.6rem] uppercase tracking-wider text-slate-600">You</span>
                  <User className="w-3 h-3 text-slate-600" />
                </div>
                <div className="rounded-2xl rounded-tr-sm bg-slate-800 border border-slate-700 px-4 py-3">
                  <p className="text-sm text-slate-100 whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ) : (
              /* Assistant bubble */
              <div className="max-w-[95%] space-y-1.5 w-full">
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-[0.6rem] uppercase tracking-wider text-emerald-500">CPG Chat</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 px-4 py-3 space-y-1">
                  <ResponseRenderer text={msg.content} />
                  {msg.sources && msg.sources.length > 0 && (
                    <SourceChips sources={msg.sources} />
                  )}
                </div>
                <div className="flex items-center gap-2 pl-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(msg)}
                    className="inline-flex items-center gap-1 text-[0.65rem] text-slate-600 hover:text-slate-300 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                    ) : (
                      <><Copy className="w-3 h-3" /><span>Copy</span></>
                    )}
                  </button>
                  {canShare && (
                    <button
                      type="button"
                      onClick={() => handleShare(msg)}
                      className="inline-flex items-center gap-1 text-[0.65rem] text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isSending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <span className="h-2 w-2 rounded-full bg-emerald-500/70 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-emerald-500/70 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-emerald-500/70 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Sticky input bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/98 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {error && (
            <p className="text-xs text-red-400 mb-2">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask a CPG question… (Enter to send, Shift+Enter for new line)"
              disabled={isSending}
              className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50 max-h-36 overflow-y-auto"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-md hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
          <p className="text-[0.6rem] text-slate-700 mt-1.5 text-center">
            Answers grounded in HMCAS CPG v2.4 (2025) only — always verify with the full guideline
          </p>
        </div>
      </div>
    </div>
  );
}
