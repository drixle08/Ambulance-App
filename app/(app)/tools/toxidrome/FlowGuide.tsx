"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FlaskConical,
  RefreshCcw,
  X,
} from "lucide-react";
import { CPG_ENTRIES, normalizeCpgSlug } from "@/lib/cpgIndex";
import {
  FLOW_MIXED_RESULT,
  FLOW_QUESTIONS,
  type FlowColor,
  type FlowResult,
} from "@/lib/toxidromeFlow";

const COLOR_STYLES: Record<
  FlowColor,
  { badge: string; card: string; title: string; accent: string; dot: string }
> = {
  orange: {
    badge: "border-orange-500/40 bg-orange-500/15 text-orange-200",
    card: "border-orange-500/30 bg-orange-950/20",
    title: "text-orange-100",
    accent: "bg-orange-500",
    dot: "bg-orange-400",
  },
  red: {
    badge: "border-red-500/40 bg-red-500/15 text-red-200",
    card: "border-red-500/30 bg-red-950/20",
    title: "text-red-100",
    accent: "bg-red-500",
    dot: "bg-red-400",
  },
  sky: {
    badge: "border-sky-500/40 bg-sky-500/15 text-sky-200",
    card: "border-sky-500/30 bg-sky-950/20",
    title: "text-sky-100",
    accent: "bg-sky-500",
    dot: "bg-sky-400",
  },
  violet: {
    badge: "border-violet-500/40 bg-violet-500/15 text-violet-200",
    card: "border-violet-500/30 bg-violet-950/20",
    title: "text-violet-100",
    accent: "bg-violet-500",
    dot: "bg-violet-400",
  },
  emerald: {
    badge: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
    card: "border-emerald-500/30 bg-emerald-950/20",
    title: "text-emerald-100",
    accent: "bg-emerald-500",
    dot: "bg-emerald-400",
  },
  lime: {
    badge: "border-lime-500/40 bg-lime-500/15 text-lime-200",
    card: "border-lime-500/30 bg-lime-950/20",
    title: "text-lime-100",
    accent: "bg-lime-500",
    dot: "bg-lime-400",
  },
  amber: {
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-200",
    card: "border-amber-500/30 bg-amber-950/20",
    title: "text-amber-100",
    accent: "bg-amber-500",
    dot: "bg-amber-400",
  },
  yellow: {
    badge: "border-yellow-500/40 bg-yellow-500/15 text-yellow-200",
    card: "border-yellow-500/30 bg-yellow-950/20",
    title: "text-yellow-100",
    accent: "bg-yellow-400",
    dot: "bg-yellow-400",
  },
  rose: {
    badge: "border-rose-500/40 bg-rose-500/15 text-rose-200",
    card: "border-rose-500/30 bg-rose-950/20",
    title: "text-rose-100",
    accent: "bg-rose-500",
    dot: "bg-rose-400",
  },
  blue: {
    badge: "border-blue-500/40 bg-blue-500/15 text-blue-200",
    card: "border-blue-500/30 bg-blue-950/20",
    title: "text-blue-100",
    accent: "bg-blue-500",
    dot: "bg-blue-400",
  },
  indigo: {
    badge: "border-indigo-500/40 bg-indigo-500/15 text-indigo-200",
    card: "border-indigo-500/30 bg-indigo-950/20",
    title: "text-indigo-100",
    accent: "bg-indigo-500",
    dot: "bg-indigo-400",
  },
  teal: {
    badge: "border-teal-500/40 bg-teal-500/15 text-teal-200",
    card: "border-teal-500/30 bg-teal-950/20",
    title: "text-teal-100",
    accent: "bg-teal-500",
    dot: "bg-teal-400",
  },
  slate: {
    badge: "border-slate-500/40 bg-slate-700/40 text-slate-200",
    card: "border-slate-600/40 bg-slate-800/40",
    title: "text-slate-100",
    accent: "bg-slate-500",
    dot: "bg-slate-400",
  },
};

type CpgLinkEntry = { code: string; title: string; href: string };

function resolveCpgLinks(codes: string[]): CpgLinkEntry[] {
  return codes.flatMap((code) => {
    const entry = CPG_ENTRIES.find((e) => e.code === code);
    if (!entry) return [];
    const slug = normalizeCpgSlug(code);
    const href = `/cpg/${encodeURIComponent(slug)}?code=${encodeURIComponent(code)}&page=${entry.printedPage}&pdfPage=${entry.printedPage}`;
    return [{ code, title: entry.title, href }];
  });
}

type FlowState = "start" | "question" | "result";

function ResultCard({
  result,
  questionLabel,
  onBack,
  onRestart,
}: {
  result: FlowResult;
  questionLabel?: string;
  onBack: () => void;
  onRestart: () => void;
}) {
  const styles = COLOR_STYLES[result.color];
  const cpgLinks = resolveCpgLinks(result.cpgCodes ?? []);
  const isMixed = result.color === "slate";

  return (
    <div className="space-y-4">
      <div className={`rounded-3xl border p-6 ${styles.card}`}>
        {/* Header */}
        <div className="mb-5 flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isMixed ? "bg-slate-700" : styles.accent
            }`}
          >
            {isMixed ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
              {isMixed ? "No pattern matched" : `Identified via ${questionLabel}`}
            </p>
            <p className="text-[11px] text-white/40">
              {isMixed ? "Reassess with clinical team" : "Toxidrome identified"}
            </p>
          </div>
        </div>

        {/* Toxidrome name */}
        <h2 className={`text-2xl font-bold leading-tight ${styles.title}`}>{result.name}</h2>

        {/* Detail */}
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{result.detail}</p>

        {/* CPG links — one button per linked protocol */}
        {cpgLinks.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Related CPG{cpgLinks.length > 1 ? "s" : ""} — open protocol PDF
            </p>
            <div className="flex flex-wrap gap-2">
              {cpgLinks.map((link) => (
                <Link
                  key={link.code}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:opacity-80 ${styles.badge}`}
                >
                  <span className="font-bold">{link.code}</span>
                  <span className="text-white/60">·</span>
                  <span>{link.title}</span>
                  <ExternalLink className="ml-0.5 h-3.5 w-3.5 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {questionLabel ? `Back to ${questionLabel}` : "Back"}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-rose-400/50 hover:text-rose-300"
        >
          <RefreshCcw className="h-4 w-4" />
          Restart
        </button>
      </div>
    </div>
  );
}

export function FlowGuide() {
  const [flowState, setFlowState] = useState<FlowState>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<FlowResult | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const currentQuestion = FLOW_QUESTIONS[currentIndex];
  const progressPct = Math.round((currentIndex / FLOW_QUESTIONS.length) * 100);

  function handleYes() {
    setResult(currentQuestion.result);
    setFlowState("result");
  }

  function handleNo() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= FLOW_QUESTIONS.length) {
      setResult(FLOW_MIXED_RESULT);
      setFlowState("result");
    } else {
      setHistory((h) => [...h, currentIndex]);
      setCurrentIndex(nextIndex);
    }
  }

  function handleBack() {
    if (flowState === "result") {
      setResult(null);
      setFlowState("question");
    } else if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setCurrentIndex(prev);
    } else {
      setFlowState("start");
    }
  }

  function handleRestart() {
    setFlowState("start");
    setCurrentIndex(0);
    setResult(null);
    setHistory([]);
  }

  // ── Start screen ──────────────────────────────────────────────────
  if (flowState === "start") {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-400">
                Sequential Assessment
              </p>
              <h2 className="text-base font-bold text-white">Toxidrome Flow Guide</h2>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-300">
            Answer{" "}
            <span className="font-semibold text-white">12 yes/no questions</span> in sequence.
            The first <span className="font-semibold text-emerald-300">YES</span> routes directly
            to the matching toxidrome and opens the linked CPG protocol.
          </p>

          <div className="mt-4 space-y-2">
            {[
              "Starts from the most immediately life-threatening patterns",
              "Each NO advances to the next discriminating question",
              "12 toxidromes covered — multi-CPG links on each result",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                {item}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setFlowState("question")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-rose-400 active:scale-[0.99]"
          >
            Begin Clinical Assessment
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Question index */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            Questions in order
          </p>
          <div className="space-y-1.5">
            {FLOW_QUESTIONS.map((q) => (
              <div key={q.id} className="flex items-center gap-2.5">
                <span
                  className={`flex h-5 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                    COLOR_STYLES[q.result.color].badge
                  }`}
                >
                  {q.label}
                </span>
                <span className="text-xs text-slate-400">{q.question}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────
  if (flowState === "result" && result) {
    return (
      <ResultCard
        result={result}
        questionLabel={result === FLOW_MIXED_RESULT ? undefined : currentQuestion?.label}
        onBack={handleBack}
        onRestart={handleRestart}
      />
    );
  }

  // ── Question screen ───────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-rose-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-500">
          {currentIndex + 1} / {FLOW_QUESTIONS.length}
        </span>
      </div>

      {/* Question card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        {/* Q label + dot trail */}
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-7 w-9 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/15 text-[11px] font-bold text-rose-300">
            {currentQuestion.label}
          </span>
          <div className="flex gap-1">
            {FLOW_QUESTIONS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < currentIndex
                    ? "w-3 bg-slate-600"
                    : i === currentIndex
                    ? "w-4 bg-rose-500"
                    : "w-1.5 bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question text */}
        <h2 className="text-xl font-bold leading-snug text-white">{currentQuestion.question}</h2>

        {/* Hint */}
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{currentQuestion.detail}</p>

        {/* YES preview chip */}
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
            COLOR_STYLES[currentQuestion.result.color].badge
          }`}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              COLOR_STYLES[currentQuestion.result.color].dot
            }`}
          />
          <span className="font-medium">YES → {currentQuestion.result.name}</span>
          {(currentQuestion.result.cpgCodes ?? []).length > 0 && (
            <span className="ml-auto font-semibold opacity-70">
              {currentQuestion.result.cpgCodes!.join(" · ")}
            </span>
          )}
        </div>
      </div>

      {/* YES / NO */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleYes}
          className="flex flex-col items-center gap-1 rounded-2xl border border-emerald-500/50 bg-emerald-500/15 px-4 py-4 text-emerald-100 transition-all hover:bg-emerald-500/25 active:scale-[0.98]"
        >
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          <span className="text-base font-bold">YES</span>
          <span className="text-[10px] text-emerald-300/70">Finding present</span>
        </button>
        <button
          type="button"
          onClick={handleNo}
          className="flex flex-col items-center gap-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-slate-200 transition-all hover:border-slate-500 hover:bg-slate-800 active:scale-[0.98]"
        >
          <ChevronRight className="h-6 w-6 text-slate-400" />
          <span className="text-base font-bold">NO</span>
          <span className="text-[10px] text-slate-500">Next question</span>
        </button>
      </div>

      {/* Back / Restart */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {history.length === 0
            ? "Start"
            : `Back to ${FLOW_QUESTIONS[history[history.length - 1]]?.label}`}
        </button>
        {(currentIndex > 0 || history.length > 0) && (
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:text-rose-300"
          >
            <RefreshCcw className="h-3 w-3" />
            Restart
          </button>
        )}
      </div>
    </div>
  );
}
