"use client";

import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  Zap,
  XCircle,
  Heart,
  AlertTriangle,
  CheckCircle,
  Baby,
  Activity,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const INITIAL_STEPS = [
  {
    label: "Recognise paediatric cardiac arrest",
    detail:
      "Unresponsive, absent or agonal breathing, no pulse. Consider undeniable death criteria (CPG 2.7).",
  },
  {
    label: "Start CPR & prepare BVM",
    detail: "High-quality chest compressions immediately. Prepare BVM.",
  },
  {
    label: "Give 5 BVM breaths → resume CPR → attach pads",
    detail:
      "Once BVM ready, deliver 5 effective breaths. Resume compressions. Attach defib pads while CPR continues.",
  },
];

type CycleItem = {
  title: string;
  badge?: string;
  points: string[];
};

const SHOCKABLE_CYCLES: CycleItem[] = [
  {
    title: "Cycle 1 — Airway & first shock",
    badge: "4 J/kg",
    points: [
      "VF/VT → single shock 4 J/kg.",
      "Immediately resume CPR 2 min.",
      "Insert SGA. Continuous compressions + ventilation every 3–5 s.",
    ],
  },
  {
    title: "Cycle 2 — IV/IO & reversible causes",
    badge: "4 J/kg",
    points: [
      "Recheck rhythm after 2 min CPR.",
      "VF/VT persists → shock 4 J/kg → resume CPR.",
      "Establish IV/IO. Search for H's & T's.",
    ],
  },
  {
    title: "Cycle 3 — Adrenaline + Amiodarone",
    badge: "4 J/kg",
    points: [
      "Shock 4 J/kg if VF/VT persists.",
      "Adrenaline 0.01 mg/kg (0.1 mL/kg of 1:10,000) IV/IO every 4 min.",
      "Amiodarone 5 mg/kg IV/IO for refractory VF/VT.",
    ],
  },
  {
    title: "Cycle 4 — 2nd Amiodarone & LUCAS",
    badge: "4 J/kg",
    points: [
      "Continue 2-min cycles with rhythm checks and 4 J/kg shocks.",
      "Repeat amiodarone 5 mg/kg if still refractory VF/VT.",
      "LUCAS if suitable size/weight — maintain compressions.",
    ],
  },
];

const NONSHOCKABLE_CYCLES: CycleItem[] = [
  {
    title: "Cycle 1 — Airway",
    points: [
      "Asystole/PEA → do NOT shock.",
      "Continue CPR 2 min.",
      "Insert SGA. Continuous compressions + ventilation every 3–5 s.",
    ],
  },
  {
    title: "Cycle 2 — IV/IO & Adrenaline",
    points: [
      "Maintain 2-min CPR cycles.",
      "Obtain IV/IO access.",
      "Adrenaline 0.01 mg/kg (0.1 mL/kg of 1:10,000) IV/IO every 4 min.",
    ],
  },
  {
    title: "Cycle 3 — Reversible Causes",
    points: [
      "Continue 2-min CPR cycles with rhythm reassessment.",
      "Actively search for and treat reversible causes (H's & T's).",
    ],
  },
  {
    title: "Cycle 4 — Ongoing Adrenaline & LUCAS",
    points: [
      "Continue adrenaline 0.01 mg/kg IV/IO every 4 min.",
      "LUCAS if suitable size/weight — maintain compressions.",
    ],
  },
];

const summaryText =
  "Paediatric cardiac arrest: start CPR, BVM, attach defib, then 2-min CPR cycles with rhythm checks. VF/VT → shock 4 J/kg; Asystole/PEA → no shock. Adrenaline 0.01 mg/kg IV/IO every 4 min; amiodarone 5 mg/kg for refractory VF/VT. Early SGA, IV/IO, reversible causes. Do NOT terminate in field — transport with CPR in progress.";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PedsArrestAlgorithmPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-8">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/resuscitation"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              Paediatric Resuscitation
            </p>
            <h1 className="text-base font-bold text-white leading-tight">
              Paediatric Cardiac Arrest Algorithm
            </h1>
          </div>
          <CopySummaryButton summaryText={summaryText} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-4 space-y-4">
        {/* ── Initial Steps ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Recognition & Setup
            </span>
          </div>
          <div className="space-y-2">
            {INITIAL_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="flex gap-3 rounded-xl bg-slate-800 p-3"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-snug">
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── No Resuscitation Note ── */}
        <div className="flex items-start gap-3 rounded-xl border border-rose-900/50 bg-rose-950/30 p-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-rose-300">
            <span className="font-semibold">Undeniable death:</span> if the
            child meets criteria (CPG 2.7), do not commence resuscitation.
          </p>
        </div>

        {/* ── Rhythm Check Decision ── */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <div className="flex items-center gap-2 rounded-full border border-emerald-700 bg-emerald-950/60 px-4 py-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Rhythm Check
            </span>
          </div>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* ── Rhythm Fork ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* VF/VT */}
          <div className="rounded-2xl border border-amber-900/60 bg-slate-900 overflow-hidden">
            <div className="flex items-center gap-2 bg-amber-950/50 px-3 py-2.5 border-b border-amber-900/40">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Shockable
                </p>
                <p className="text-xs font-semibold text-amber-200">VF / VT</p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[11px] text-amber-300/80">
                Single shock <span className="font-bold">4 J/kg</span> → immediate CPR
              </p>
              {SHOCKABLE_CYCLES.map((cycle, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-800/80 border border-amber-900/30 p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-white leading-snug">
                      {idx + 1}. {cycle.title}
                    </p>
                    {cycle.badge && (
                      <span className="flex-shrink-0 rounded-md bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                        {cycle.badge}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {cycle.points.map((p, pi) => (
                      <li key={pi} className="flex gap-1.5 text-[11px] text-slate-400">
                        <span className="mt-1 w-1 h-1 rounded-full bg-amber-500/70 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Asystole / PEA */}
          <div className="rounded-2xl border border-sky-900/60 bg-slate-900 overflow-hidden">
            <div className="flex items-center gap-2 bg-sky-950/50 px-3 py-2.5 border-b border-sky-900/40">
              <XCircle className="w-4 h-4 text-sky-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Non-shockable
                </p>
                <p className="text-xs font-semibold text-sky-200">
                  Asystole / PEA
                </p>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[11px] text-sky-300/80">
                Do <span className="font-bold">NOT</span> shock → CPR continues
              </p>
              {NONSHOCKABLE_CYCLES.map((cycle, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-800/80 border border-sky-900/30 p-3 space-y-1.5"
                >
                  <p className="text-xs font-semibold text-white leading-snug">
                    {idx + 1}. {cycle.title}
                  </p>
                  <ul className="space-y-1">
                    {cycle.points.map((p, pi) => (
                      <li key={pi} className="flex gap-1.5 text-[11px] text-slate-400">
                        <span className="mt-1 w-1 h-1 rounded-full bg-sky-500/70 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROSC Decision ── */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <div className="flex items-center gap-2 rounded-full border border-amber-600 bg-amber-950/60 px-4 py-1.5">
            <Heart className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              ROSC?
            </span>
          </div>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* ── ROSC Outcomes ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-900/60 bg-slate-900 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Yes — ROSC
              </p>
            </div>
            <p className="text-xs text-slate-300">
              Manage per{" "}
              <span className="font-semibold text-white">ROSC CPG 2.6</span> for
              paeds. Optimise oxygenation, ventilation, BP and temperature.
              Early transport to appropriate facility.
            </p>
          </div>

          <div className="rounded-2xl border border-orange-900/60 bg-slate-900 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                No — Continue
              </p>
            </div>
            <p className="text-xs text-slate-300">
              Continue 2-min CPR cycles. VF/VT → 4 J/kg shocks + adrenaline +
              amiodarone. Asystole/PEA → CPR + adrenaline + reversible causes.
            </p>
          </div>

          <div className="rounded-2xl border border-rose-900/60 bg-slate-900 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                No Field Termination
              </p>
            </div>
            <p className="text-xs text-slate-300">
              <span className="font-semibold text-white">
                Do NOT terminate paediatric resuscitation in the field.
              </span>{" "}
              Transport to appropriate facility with CPR in progress per CPG and
              Clinical Coordination.
            </p>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <p className="text-[11px] text-slate-600 pb-2">
          Visual aid only. Follow current HMCAS CPGs and Clinical Coordination
          when managing paediatric cardiac arrest.
        </p>
      </main>
    </div>
  );
}
