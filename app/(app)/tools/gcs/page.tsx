"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  RotateCcw,
  Eye,
  MessageCircle,
  Hand,
  User,
  Baby,
  Brain,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = "adult" | "paeds";
type EyeScore = 1 | 2 | 3 | 4;
type VerbalScore = 1 | 2 | 3 | 4 | 5;
type MotorScore = 1 | 2 | 3 | 4 | 5 | 6;

// ─── Score colour gradient (1=worst → 6=best) ────────────────────────────────

const SCORE_COLOR: Record<number, { badge: string; selected: string }> = {
  1: {
    badge: "bg-rose-900/80 text-rose-300",
    selected: "border-rose-600/70 bg-rose-950/60",
  },
  2: {
    badge: "bg-orange-900/80 text-orange-300",
    selected: "border-orange-600/70 bg-orange-950/60",
  },
  3: {
    badge: "bg-amber-900/80 text-amber-300",
    selected: "border-amber-600/70 bg-amber-950/60",
  },
  4: {
    badge: "bg-sky-900/80 text-sky-300",
    selected: "border-sky-600/70 bg-sky-950/60",
  },
  5: {
    badge: "bg-emerald-900/80 text-emerald-300",
    selected: "border-emerald-600/70 bg-emerald-950/60",
  },
  6: {
    badge: "bg-emerald-900/80 text-emerald-300",
    selected: "border-emerald-600/70 bg-emerald-950/60",
  },
};

// ─── Severity band ────────────────────────────────────────────────────────────

type Band = "severe" | "moderate" | "mild";

function getBand(total: number): Band {
  if (total <= 8) return "severe";
  if (total <= 12) return "moderate";
  return "mild";
}

const BAND_STYLES: Record<
  Band,
  { label: string; range: string; text: string; border: string; bg: string; bar: string }
> = {
  severe: {
    label: "Severe",
    range: "3–8",
    text: "text-rose-300",
    border: "border-rose-700",
    bg: "bg-rose-950/70",
    bar: "bg-rose-500",
  },
  moderate: {
    label: "Moderate",
    range: "9–12",
    text: "text-amber-300",
    border: "border-amber-700",
    bg: "bg-amber-950/70",
    bar: "bg-amber-500",
  },
  mild: {
    label: "Mild",
    range: "13–15",
    text: "text-emerald-300",
    border: "border-emerald-700",
    bg: "bg-emerald-950/70",
    bar: "bg-emerald-500",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GcsPage() {
  const [mode, setMode] = useState<Mode>("adult");
  const [eye, setEye] = useState<EyeScore>(4);
  const [verbal, setVerbal] = useState<VerbalScore>(5);
  const [motor, setMotor] = useState<MotorScore>(6);

  const total = eye + verbal + motor;
  const band = getBand(total);
  const bs = BAND_STYLES[band];
  const barWidth = `${((total - 3) / 12) * 100}%`;

  const adultVerbal: { score: VerbalScore; label: string }[] = [
    { score: 5, label: "Oriented" },
    { score: 4, label: "Confused conversation" },
    { score: 3, label: "Inappropriate words" },
    { score: 2, label: "Incomprehensible sounds" },
    { score: 1, label: "No verbal response" },
  ];

  const paedsVerbal: { score: VerbalScore; label: string }[] = [
    { score: 5, label: "Coos / babbles / appropriate words" },
    { score: 4, label: "Irritable cry — consolable" },
    { score: 3, label: "Persistent crying / screaming" },
    { score: 2, label: "Moans / grunts to pain" },
    { score: 1, label: "No response" },
  ];

  const verbalOptions = mode === "adult" ? adultVerbal : paedsVerbal;

  const eyeLabel =
    eye === 4 ? "Spontaneous" : eye === 3 ? "To speech" : eye === 2 ? "To pain" : "No eye opening";
  const motorLabel =
    motor === 6 ? "Obeys commands" : motor === 5 ? "Localises pain" :
    motor === 4 ? "Withdraws from pain" : motor === 3 ? "Abnormal flexion" :
    motor === 2 ? "Abnormal extension" : "No motor response";

  function handleReset() {
    setEye(4);
    setVerbal(5);
    setMotor(6);
  }

  const summaryText = `GCS ${total} (E${eye} V${verbal} M${motor}) — ${bs.label} impairment (${bs.range}). E: ${eyeLabel}. V: ${verbalOptions.find((o) => o.score === verbal)?.label}. M: ${motorLabel}. CPG 1.4 Glasgow Coma Scale.`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-40">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/assessment"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">
              Neurological
            </p>
            <h1 className="text-base font-bold text-white leading-tight">
              Glasgow Coma Scale (GCS)
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </button>
            <CopySummaryButton summaryText={summaryText} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-4">
        {/* ── Mode toggle ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("adult")}
            className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors text-left ${
              mode === "adult"
                ? "border-violet-500/70 bg-violet-950/50"
                : "border-slate-700 bg-slate-900 hover:border-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                mode === "adult" ? "bg-violet-900/60 text-violet-400" : "bg-slate-800 text-slate-500"
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Adult</p>
              <p className="text-[11px] text-slate-400">Verbal child included</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode("paeds")}
            className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors text-left ${
              mode === "paeds"
                ? "border-emerald-500/70 bg-emerald-950/50"
                : "border-slate-700 bg-slate-900 hover:border-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                mode === "paeds" ? "bg-emerald-900/60 text-emerald-400" : "bg-slate-800 text-slate-500"
              }`}
            >
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Paediatric</p>
              <p className="text-[11px] text-slate-400">Pre-verbal scale</p>
            </div>
          </button>
        </div>

        {/* ── Running score ── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total GCS</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black tabular-nums ${bs.text}`}>{total}</span>
                <span className="text-base font-mono text-slate-500">
                  E{eye} + V{verbal} + M{motor}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${bs.text}`}>{bs.label} impairment</p>
              <p className="text-[10px] text-slate-500">Range {bs.range}</p>
            </div>
          </div>
          {/* Progress bar 3–15 */}
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${bs.bar}`}
              style={{ width: barWidth }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-600">
            <span>3 — Severe</span>
            <span>9 — Moderate</span>
            <span>13 — Mild</span>
            <span>15</span>
          </div>
        </div>

        {/* ── E: Eye Opening ── */}
        <ScoreSection
          letter="E"
          label="Eye Opening"
          current={eye}
          icon={<Eye className="w-4 h-4 text-violet-400" />}
        >
          {[
            { score: 4 as EyeScore, label: "Spontaneous" },
            { score: 3 as EyeScore, label: "To speech / sound" },
            { score: 2 as EyeScore, label: "To pain / pressure" },
            { score: 1 as EyeScore, label: "No eye opening" },
          ].map((opt) => (
            <ScoreOption
              key={opt.score}
              score={opt.score}
              label={opt.label}
              selected={eye === opt.score}
              onClick={() => setEye(opt.score)}
            />
          ))}
        </ScoreSection>

        {/* ── V: Verbal Response ── */}
        <ScoreSection
          letter="V"
          label={mode === "adult" ? "Verbal Response" : "Verbal Response (Pre-verbal)"}
          current={verbal}
          icon={<MessageCircle className="w-4 h-4 text-violet-400" />}
        >
          {verbalOptions.map((opt) => (
            <ScoreOption
              key={opt.score}
              score={opt.score}
              label={opt.label}
              selected={verbal === opt.score}
              onClick={() => setVerbal(opt.score)}
            />
          ))}
        </ScoreSection>

        {/* ── M: Motor Response ── */}
        <ScoreSection
          letter="M"
          label="Motor Response"
          current={motor}
          icon={<Hand className="w-4 h-4 text-violet-400" />}
        >
          {[
            { score: 6 as MotorScore, label: "Obeys commands" },
            { score: 5 as MotorScore, label: "Localises pain" },
            { score: 4 as MotorScore, label: "Withdraws from pain" },
            { score: 3 as MotorScore, label: "Abnormal flexion (decorticate)" },
            { score: 2 as MotorScore, label: "Abnormal extension (decerebrate)" },
            { score: 1 as MotorScore, label: "No motor response" },
          ].map((opt) => (
            <ScoreOption
              key={opt.score}
              score={opt.score}
              label={opt.label}
              selected={motor === opt.score}
              onClick={() => setMotor(opt.score)}
            />
          ))}
        </ScoreSection>

        {/* ── Notes ── */}
        <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <Brain className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Record as <span className="font-mono text-slate-300">GCS {total} (E{eye} V{verbal} M{motor})</span> and trend over time.
            Note any factors affecting the score (sedation, intubation, language barrier).
            CPG 1.4 Glasgow Coma Scale.
          </p>
        </div>
        <div className="h-1" />
      </main>

      {/* ── Sticky Outcome Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className={`rounded-xl border p-3 ${bs.border} ${bs.bg}`}>
            <div className="flex items-center gap-4">
              {/* Big GCS */}
              <div className="flex-shrink-0 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">GCS</p>
                <p className={`text-3xl font-black tabular-nums leading-none mt-0.5 ${bs.text}`}>
                  {total}
                </p>
              </div>
              <div className="w-px h-10 bg-slate-700 flex-shrink-0" />
              {/* Component breakdown */}
              <div className="flex gap-3 flex-1">
                {[
                  { l: "E", v: eye, c: SCORE_COLOR[eye] },
                  { l: "V", v: verbal, c: SCORE_COLOR[verbal] },
                  { l: "M", v: motor, c: SCORE_COLOR[motor] },
                ].map(({ l, v, c }) => (
                  <div key={l} className="text-center">
                    <p className="text-[10px] text-slate-500">{l}</p>
                    <span className={`text-lg font-bold tabular-nums ${c.badge.includes("emerald") ? "text-emerald-300" : c.badge.includes("sky") ? "text-sky-300" : c.badge.includes("amber") ? "text-amber-300" : c.badge.includes("orange") ? "text-orange-300" : "text-rose-300"}`}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-px h-10 bg-slate-700 flex-shrink-0" />
              {/* Severity label */}
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${bs.text}`}>{bs.label}</p>
                <p className="text-[10px] text-slate-500">{bs.range}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreSection({
  letter,
  label,
  current,
  icon,
  children,
}: {
  letter: string;
  label: string;
  current: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const c = SCORE_COLOR[current];
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 ${c.badge}`}
        >
          {letter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {icon}
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {label}
            </p>
          </div>
        </div>
        <span className={`text-lg font-bold tabular-nums ${c.badge.split(" ")[1]}`}>
          {current}
        </span>
      </div>
      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
}

function ScoreOption({
  score,
  label,
  selected,
  onClick,
}: {
  score: number;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const c = SCORE_COLOR[score];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors active:scale-[0.99] ${
        selected
          ? c.selected
          : "border-slate-700 bg-slate-800 hover:border-slate-600"
      }`}
    >
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold tabular-nums ${
          selected ? c.badge : "bg-slate-700 text-slate-400"
        }`}
      >
        {score}
      </span>
      <span
        className={`text-sm font-medium leading-snug ${
          selected ? "text-white" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
