"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  Zap,
  XCircle,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Pill,
  AlertTriangle,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Rhythm = "shockable" | "nonShockable" | null;

type ActionLine = {
  type: "action" | "drug" | "shock" | "noshock" | "warn";
  text: string;
  sub?: string;
};

type CycleBlock = {
  label: string;
  color: "amber" | "sky" | "slate";
  actions: ActionLine[];
};

// ─── Algorithm data ────────────────────────────────────────────────────────────

const SHOCKABLE_CYCLES: CycleBlock[] = [
  {
    label: "Cycle 1",
    color: "amber",
    actions: [
      { type: "shock", text: "200 J" },
      { type: "action", text: "Resume CPR — 2 minutes" },
      { type: "action", text: "Insert SGA → switch to continuous compressions" },
      { type: "action", text: "Ventilate every 6–8 sec (~10 bpm)" },
    ],
  },
  {
    label: "Cycle 2",
    color: "amber",
    actions: [
      { type: "shock", text: "300 J" },
      { type: "action", text: "Resume CPR — 2 minutes" },
      { type: "action", text: "Establish IV/IO access" },
      { type: "action", text: "Reversible causes — H's & T's" },
    ],
  },
  {
    label: "Cycle 3",
    color: "amber",
    actions: [
      { type: "shock", text: "360 J" },
      { type: "action", text: "Resume CPR — 2 minutes" },
      { type: "drug", text: "Adrenaline 1 mg IV/IO", sub: "then 1 mg every 4 min" },
      { type: "drug", text: "Amiodarone 300 mg IV/IO" },
      { type: "action", text: "Consider A-P / DSED pad placement + LUCAS" },
    ],
  },
  {
    label: "Ongoing cycles",
    color: "amber",
    actions: [
      { type: "shock", text: "360 J" },
      { type: "action", text: "Continue 2-min CPR cycles" },
      { type: "drug", text: "Adrenaline 1 mg IV/IO every 4 min" },
      { type: "drug", text: "Amiodarone 150 mg IV/IO (repeat dose)" },
      { type: "action", text: "LUCAS — continuous mode when available" },
      { type: "action", text: "Reassess rhythm + reversible causes each cycle" },
    ],
  },
];

const NONSHOCKABLE_CYCLES: CycleBlock[] = [
  {
    label: "Early cycles",
    color: "sky",
    actions: [
      { type: "noshock", text: "No shock — CPR only" },
      { type: "action", text: "2-min CPR cycles with minimal pauses" },
      { type: "action", text: "Insert SGA → continuous compressions" },
      { type: "action", text: "Ventilate every 6–8 sec (~10 bpm)" },
      { type: "action", text: "Establish IV/IO access" },
      { type: "drug", text: "Adrenaline 1 mg IV/IO ASAP" },
    ],
  },
  {
    label: "Ongoing cycles",
    color: "sky",
    actions: [
      { type: "noshock", text: "No shock" },
      { type: "action", text: "Continue 2-min CPR cycles" },
      { type: "drug", text: "Adrenaline 1 mg IV/IO every 4 min" },
      { type: "action", text: "Systematically work through H's & T's" },
      { type: "action", text: "LUCAS when available — continuous mode" },
      { type: "action", text: "Reassess rhythm + ROSC at each cycle end" },
    ],
  },
];

const HS_AND_TS = [
  { h: "Hypoxia", t: "Tension pneumothorax" },
  { h: "Hypovolaemia", t: "Tamponade (cardiac)" },
  { h: "Hydrogen ion (acidosis)", t: "Toxins / drugs" },
  { h: "Hypo/hyperkalemia", t: "Thrombosis — PE" },
  { h: "Hypothermia", t: "Thrombosis — coronary" },
];

// ─── Summary text ──────────────────────────────────────────────────────────────

const summaryText =
  "Adult unwitnessed cardiac arrest – followed updated HMCAS arrest algorithm: assess for undeniable death (CPG 2.7) then start CPR, attach defibrillator/monitor and assess rhythm. For VF/VT: shocks 200 J, then 300 J, then 360 J with 2-min CPR cycles, SGA with continuous compressions, IV/IO access, reversible causes (H's & T's), adrenaline 1 mg every 4 min, amiodarone 300 mg then 150 mg, and LUCAS when available. For asystole/PEA: 2-min CPR cycles with SGA, early adrenaline 1 mg then 1 mg every 4 min, reversible causes and LUCAS preparation. ROSC → CPG 2.6; consider termination as per CPG 2.7.";

// ─── Sub-components ────────────────────────────────────────────────────────────

function ActionRow({ line }: { line: ActionLine }) {
  if (line.type === "shock") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2.5">
        <Zap className="h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <span className="text-xl font-bold tabular-nums text-amber-300">{line.text}</span>
          <span className="ml-1.5 text-xs text-amber-400">biphasic</span>
        </div>
      </div>
    );
  }

  if (line.type === "noshock") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-2.5">
        <XCircle className="h-5 w-5 shrink-0 text-sky-400" />
        <span className="text-sm font-semibold text-sky-300">{line.text}</span>
      </div>
    );
  }

  if (line.type === "drug") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5">
        <Pill className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
        <div>
          <p className="text-sm font-semibold text-emerald-200">{line.text}</p>
          {line.sub && <p className="text-[0.68rem] text-emerald-400">{line.sub}</p>}
        </div>
      </div>
    );
  }

  if (line.type === "warn") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2.5">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
        <p className="text-sm text-rose-200">{line.text}</p>
      </div>
    );
  }

  // default: "action"
  return (
    <div className="flex items-start gap-2.5 px-1 py-1">
      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
      <p className="text-sm text-slate-200">{line.text}</p>
    </div>
  );
}

function CycleCard({ block }: { block: CycleBlock }) {
  const labelColor =
    block.color === "amber"
      ? "text-amber-400"
      : block.color === "sky"
      ? "text-sky-400"
      : "text-slate-400";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
      <div className={`px-4 py-2 border-b border-slate-800`}>
        <p className={`text-[0.65rem] font-bold uppercase tracking-[0.22em] ${labelColor}`}>
          {block.label}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        {block.actions.map((line, i) => (
          <ActionRow key={i} line={line} />
        ))}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdultArrestReferencePage() {
  const [rhythm, setRhythm] = useState<Rhythm>(null);
  const [htsOpen, setHtsOpen] = useState(false);

  const cycles =
    rhythm === "shockable"
      ? SHOCKABLE_CYCLES
      : rhythm === "nonShockable"
      ? NONSHOCKABLE_CYCLES
      : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-6">

      {/* ── Sticky header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard/resuscitation"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-red-400">
              Resuscitation · CPG 2.x
            </p>
            <h1 className="text-sm font-semibold leading-tight text-slate-50">
              Adult Cardiac Arrest — Unwitnessed
            </h1>
          </div>
          <CopySummaryButton summaryText={summaryText} />
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-4">

        {/* ── Step 1: Confirm arrest ────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="border-b border-slate-800 px-4 py-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400">
              Step 1 — Confirm arrest
            </p>
          </div>
          <div className="flex flex-col gap-1.5 p-3">
            <ActionRow line={{ type: "action", text: "Unresponsive + absent or agonal breathing" }} />
            <ActionRow line={{ type: "action", text: "No normal pulse — confirm quickly" }} />
            <ActionRow line={{ type: "warn", text: "If features of undeniable death — do NOT commence resuscitation (CPG 2.7)" }} />
          </div>
        </section>

        {/* ── Step 2: Start CPR ─────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="border-b border-slate-800 px-4 py-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400">
              Step 2 — Start CPR
            </p>
          </div>
          <div className="flex flex-col gap-1.5 p-3">
            <ActionRow line={{ type: "action", text: "Start CPR immediately" }} />
            <ActionRow line={{ type: "action", text: "Attach defibrillator / monitor as soon as safe" }} />
            <ActionRow line={{ type: "action", text: "Minimise interruptions to compressions" }} />
            <ActionRow line={{ type: "action", text: "Assess rhythm when pads are on" }} />
          </div>
        </section>

        {/* ── Rhythm assessment selector ───────────────────────────── */}
        <section className="space-y-2">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1">
            Step 3 — Rhythm assessed?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRhythm(rhythm === "shockable" ? null : "shockable")}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-center transition-all active:scale-[0.97] ${
                rhythm === "shockable"
                  ? "border-amber-500/70 bg-amber-500/15 text-amber-100"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Zap className={`h-6 w-6 ${rhythm === "shockable" ? "text-amber-400" : "text-slate-600"}`} />
              <span className="text-sm font-bold">VF / VT</span>
              <span className="text-[0.65rem] text-slate-500">Shockable</span>
            </button>
            <button
              type="button"
              onClick={() => setRhythm(rhythm === "nonShockable" ? null : "nonShockable")}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-center transition-all active:scale-[0.97] ${
                rhythm === "nonShockable"
                  ? "border-sky-500/70 bg-sky-500/15 text-sky-100"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <XCircle className={`h-6 w-6 ${rhythm === "nonShockable" ? "text-sky-400" : "text-slate-600"}`} />
              <span className="text-sm font-bold">Asystole / PEA</span>
              <span className="text-[0.65rem] text-slate-500">Non-shockable</span>
            </button>
          </div>

          {/* Prompt if not selected */}
          {rhythm === null && (
            <p className="text-center text-[0.7rem] text-slate-600 pt-1">
              Tap rhythm to show the treatment pathway
            </p>
          )}
        </section>

        {/* ── Pathway cycles ────────────────────────────────────────── */}
        {cycles.length > 0 && (
          <section className="flex flex-col gap-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1">
              {rhythm === "shockable" ? "Shockable pathway — VF / VT" : "Non-shockable pathway — Asystole / PEA"}
            </p>
            {cycles.map((block, i) => (
              <CycleCard key={i} block={block} />
            ))}
          </section>
        )}

        {/* ── H's & T's quick reference ─────────────────────────────── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setHtsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400">
              Reversible causes — H's &amp; T's
            </p>
            {htsOpen
              ? <ChevronUp className="h-4 w-4 text-slate-500" />
              : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>
          {htsOpen && (
            <div className="border-t border-slate-800 grid grid-cols-2 divide-x divide-slate-800">
              <div className="p-3 space-y-1.5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">H's</p>
                {HS_AND_TS.map((row, i) => (
                  <p key={i} className="text-xs text-slate-300 flex gap-2">
                    <span className="text-slate-600 shrink-0">·</span>{row.h}
                  </p>
                ))}
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">T's</p>
                {HS_AND_TS.map((row, i) => (
                  <p key={i} className="text-xs text-slate-300 flex gap-2">
                    <span className="text-slate-600 shrink-0">·</span>{row.t}
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── ROSC / Termination ───────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/8 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-emerald-400" />
              <p className="text-xs font-bold text-emerald-300">ROSC</p>
            </div>
            <p className="text-[0.7rem] text-emerald-200">
              Transition to post-arrest care
            </p>
            <p className="text-[0.65rem] text-emerald-400 font-semibold">→ CPG 2.6</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-bold text-slate-400">No ROSC</p>
            </div>
            <p className="text-[0.7rem] text-slate-400">
              Consider termination of resuscitation
            </p>
            <p className="text-[0.65rem] text-slate-500 font-semibold">→ CPG 2.7</p>
          </div>
        </section>

        {/* ── Disclaimer ───────────────────────────────────────────── */}
        <p className="text-[0.65rem] text-slate-600 pb-2">
          Quick reference only. Always follow current CPG 2.x, device instructions, and Clinical Coordination advice. Does not replace the full arrest guideline.
        </p>

      </main>
    </div>
  );
}
