"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  Zap,
  XCircle,
  HeartPulse,
  Users,
  User,
  ChevronDown,
  ChevronUp,
  GitMerge,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type FlowStep = {
  label: string;
  detail?: string;
  type?: "action" | "decision" | "rhythm";
};

type ScenarioId = "two-rescuer" | "single-no-pads" | "single-pads-on";

type Scenario = {
  id: ScenarioId;
  title: string;
  subtitle: string;
  steps: FlowStep[];
};

// ─── Data (unchanged logic) ────────────────────────────────────────────────────

const TWO_RESCUER_STEPS: FlowStep[] = [
  {
    label: "Recognise witnessed arrest — call for help",
    detail:
      "Patient already on monitor with AP pads when arrest occurs. Unresponsive + absent or agonal breathing. R1 confirms arrest, calls for help, notifies NCC / Clinical Coordination.",
    type: "action",
  },
  {
    label: "Analyse rhythm (pads already on)",
    detail:
      "AP pads already attached. R2 pauses briefly to analyse rhythm before the first CPR cycle.",
    type: "decision",
  },
  {
    label: "VF / VT — Shockable",
    detail:
      "R2 charges while R1 continues compressions. Single shock at appropriate energy, then immediately resume CPR for 2 minutes.",
    type: "rhythm",
  },
  {
    label: "Asystole / PEA — Non-shockable",
    detail:
      "Do not shock. R1 starts CPR + 2-min timer. If IV/IO in place, adrenaline 1 mg IV/IO early (before airway/LT) with minimal interruption, then every 4 min as per CPG.",
    type: "rhythm",
  },
  {
    label: "Continue standard adult arrest algorithm",
    detail:
      "2-min CPR cycles with rhythm checks, single shocks for VF/VT, ongoing adrenaline schedule, airway strategy, LUCAS, ROSC and termination. R1: compressions · R2: defib, drugs, airway.",
    type: "action",
  },
];

const SINGLE_NO_PADS_STEPS: FlowStep[] = [
  {
    label: "Recognise arrest — alert partner / NCC",
    detail:
      "Witnessed collapse: unresponsive + absent or agonal breathing. Alert partner to call for help and notify NCC while you stay with the patient.",
    type: "action",
  },
  {
    label: "Retrieve defib — apply pads immediately",
    detail:
      "Power on defibrillator and apply pads in anterior–posterior (AP) position as quickly as possible. Minimise delay — getting pads on is the priority.",
    type: "action",
  },
  {
    label: "Analyse rhythm",
    detail:
      "Once AP pads are attached and connected, briefly pause to analyse rhythm.",
    type: "decision",
  },
  {
    label: "VF / VT — Shockable",
    detail:
      "Charge while performing compressions if safe. Single shock at appropriate energy, then immediately resume CPR for 2 minutes.",
    type: "rhythm",
  },
  {
    label: "Asystole / PEA — Non-shockable",
    detail:
      "No shock. Start or resume CPR + 2-min timer. Give adrenaline when appropriate as per CPG.",
    type: "rhythm",
  },
  {
    label: "Partner arrives — standard adult arrest algorithm",
    detail:
      "Transition to standard adult arrest algorithm with two rescuers: 2-min CPR cycles, rhythm checks, single shocks for VF/VT, drug schedule, airway, LUCAS, ROSC and termination.",
    type: "action",
  },
];

const SINGLE_PADS_ON_STEPS: FlowStep[] = [
  {
    label: "Recognise witnessed arrest — call for help",
    detail:
      "Critical patient already on monitor with AP pads when arrest occurs. Unresponsive + absent or agonal breathing. Confirm arrest, call for help, notify NCC / Clinical Coordination.",
    type: "action",
  },
  {
    label: "Analyse rhythm first (pads already on)",
    detail:
      "AP pads already attached. Briefly pause to analyse rhythm before starting CPR.",
    type: "decision",
  },
  {
    label: "VF / VT — Shockable",
    detail:
      "Charge and deliver single shock, then immediately start CPR for 2 minutes.",
    type: "rhythm",
  },
  {
    label: "Asystole / PEA — Non-shockable",
    detail:
      "Start CPR for 2 minutes (no shock). If IV/IO in place, adrenaline 1 mg early (before airway/LT) with minimal interruption.",
    type: "rhythm",
  },
  {
    label: "Crew arrives — move to multi-rescuer algorithm",
    detail:
      "Transition to standard adult arrest algorithm: ongoing drug schedule, airway strategy, LUCAS, ROSC and termination as per CPG.",
    type: "action",
  },
];

const SCENARIOS: Scenario[] = [
  {
    id: "two-rescuer",
    title: "2 Rescuers — pads on",
    subtitle: "Both AP staff present · patient already monitored with AP pads",
    steps: TWO_RESCUER_STEPS,
  },
  {
    id: "single-no-pads",
    title: "Solo — no pads",
    subtitle: "One AP present · defib in bag · no pads on patient",
    steps: SINGLE_NO_PADS_STEPS,
  },
  {
    id: "single-pads-on",
    title: "Solo — pads on",
    subtitle: "One AP present · patient already monitored with AP pads",
    steps: SINGLE_PADS_ON_STEPS,
  },
];

const summaryText =
  "Adult witnessed cardiac arrest (witnessed by Ambulance Service staff during transport/care). Pads in anterior–posterior position. If pads are not attached: start CPR immediately, then attach pads and analyse rhythm as soon as practical. If pads are already on or immediately available: analyse rhythm first, then single shocks for VF/VT with immediate CPR and standard drug schedule, or CPR with early adrenaline for non-shockable rhythms. For non-shockable arrest with IV access, adrenaline 1 mg IV/IO may be given before airway/LT insertion, with ongoing doses every 4 minutes per CPG.";

// ─── Step grouping ─────────────────────────────────────────────────────────────

type StepGroup =
  | { kind: "single"; step: FlowStep; index: number }
  | { kind: "fork"; shockable: FlowStep; nonShockable: FlowStep; index: number };

function groupSteps(steps: FlowStep[]): StepGroup[] {
  const groups: StepGroup[] = [];
  let i = 0;
  let n = 1;
  while (i < steps.length) {
    const curr = steps[i];
    const next = steps[i + 1];
    if (curr.type === "rhythm" && next?.type === "rhythm") {
      const shockable = curr.label.toLowerCase().includes("vf") ? curr : next;
      const nonShockable = curr === shockable ? next : curr;
      groups.push({ kind: "fork", shockable, nonShockable, index: n });
      i += 2;
      n += 2;
    } else {
      groups.push({ kind: "single", step: curr, index: n });
      i++;
      n++;
    }
  }
  return groups;
}

// ─── Step renderer ─────────────────────────────────────────────────────────────

function StepCard({ step, index }: { step: FlowStep; index: number }) {
  const isDecision = step.type === "decision";
  const cardStyle = isDecision
    ? "border-amber-500/50 bg-amber-500/10"
    : "border-slate-800 bg-slate-900/70";
  const labelStyle = isDecision ? "text-amber-200" : "text-slate-100";
  const detailStyle = isDecision ? "text-amber-300/80" : "text-slate-400";
  const badgeStyle = isDecision
    ? "bg-amber-500 text-slate-950"
    : "bg-slate-700 text-slate-200";
  const iconEl = isDecision
    ? <GitMerge className="h-3 w-3" />
    : <span className="text-[0.6rem] font-bold">{index}</span>;

  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-3 py-3 ${cardStyle}`}>
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${badgeStyle}`}>
        {iconEl}
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-semibold leading-snug ${labelStyle}`}>{step.label}</p>
        {step.detail && (
          <p className={`mt-0.5 text-[0.72rem] leading-relaxed ${detailStyle}`}>{step.detail}</p>
        )}
      </div>
    </div>
  );
}

function ForkCard({ shockable, nonShockable }: { shockable: FlowStep; nonShockable: FlowStep }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* VF/VT */}
      <div className="flex flex-col gap-1.5 rounded-2xl border border-amber-500/50 bg-amber-500/10 p-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs font-bold text-amber-300">VF / VT</p>
        </div>
        <p className="text-[0.7rem] leading-relaxed text-amber-200/80">{shockable.detail}</p>
      </div>
      {/* Asystole/PEA */}
      <div className="flex flex-col gap-1.5 rounded-2xl border border-sky-500/50 bg-sky-500/10 p-3">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0 text-sky-400" />
          <p className="text-xs font-bold text-sky-300">Asystole / PEA</p>
        </div>
        <p className="text-[0.7rem] leading-relaxed text-sky-200/80">{nonShockable.detail}</p>
      </div>
    </div>
  );
}

// ─── Scenario tile ─────────────────────────────────────────────────────────────

const SCENARIO_META: Record<ScenarioId, { icon: React.ElementType; color: string; activeStyle: string }> = {
  "two-rescuer": {
    icon: Users,
    color: "text-emerald-400",
    activeStyle: "border-emerald-500/60 bg-emerald-500/10 text-emerald-100",
  },
  "single-no-pads": {
    icon: User,
    color: "text-rose-400",
    activeStyle: "border-rose-500/60 bg-rose-500/10 text-rose-100",
  },
  "single-pads-on": {
    icon: User,
    color: "text-amber-400",
    activeStyle: "border-amber-500/60 bg-amber-500/10 text-amber-100",
  },
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function WitnessedAdultArrestPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>("two-rescuer");
  const [notesOpen, setNotesOpen] = useState(false);

  const activeScenario = SCENARIOS.find((s) => s.id === selectedScenario) ?? SCENARIOS[0];
  const grouped = groupSteps(activeScenario.steps);

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
              Adult Cardiac Arrest — Witnessed
            </h1>
          </div>
          <CopySummaryButton summaryText={summaryText} />
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-4">

        {/* ── Key rules quick reference ─────────────────────────────── */}
        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 space-y-0.5">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-slate-500">Pads NOT on</p>
            <p className="text-xs text-slate-300 font-medium">CPR first → attach pads → analyse</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 space-y-0.5">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-slate-500">Pads already on</p>
            <p className="text-xs text-slate-300 font-medium">Analyse first → treat rhythm</p>
          </div>
        </section>

        {/* ── Pad placement reminder ────────────────────────────────── */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-[0.7rem] text-slate-400">
          <span className="font-semibold text-slate-300">Pad position:</span> Anterior–Posterior (AP) · Single-shock sequence: 200 J → 300 J → 360 J with immediate CPR after each shock
        </div>

        {/* ── Scenario selector ─────────────────────────────────────── */}
        <section className="space-y-2">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1">
            Select your scenario
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SCENARIOS.map((scenario) => {
              const meta = SCENARIO_META[scenario.id];
              const Icon = meta.icon;
              const active = scenario.id === selectedScenario;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 px-2 text-center transition-all active:scale-[0.97] ${
                    active
                      ? meta.activeStyle
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? meta.color : "text-slate-600"}`} />
                  <span className="text-[0.68rem] font-semibold leading-tight">{scenario.title}</span>
                </button>
              );
            })}
          </div>
          {/* Active scenario subtitle */}
          <p className="text-[0.68rem] text-slate-500 px-1">{activeScenario.subtitle}</p>
        </section>

        {/* ── Flow steps ────────────────────────────────────────────── */}
        <section className="flex flex-col gap-2">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1">
            Sequence of actions
          </p>
          {grouped.map((group, i) =>
            group.kind === "fork" ? (
              <ForkCard
                key={i}
                shockable={group.shockable}
                nonShockable={group.nonShockable}
              />
            ) : (
              <StepCard key={i} step={group.step} index={group.index} />
            )
          )}
        </section>

        {/* ── ROSC / Termination ───────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/8 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-emerald-400" />
              <p className="text-xs font-bold text-emerald-300">ROSC</p>
            </div>
            <p className="text-[0.7rem] text-emerald-200">Post-arrest care</p>
            <p className="text-[0.65rem] font-semibold text-emerald-400">→ CPG 2.6</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-slate-500" />
              <p className="text-xs font-bold text-slate-400">No ROSC</p>
            </div>
            <p className="text-[0.7rem] text-slate-400">Consider termination</p>
            <p className="text-[0.65rem] font-semibold text-slate-500">→ CPG 2.7</p>
          </div>
        </section>

        {/* ── Shared notes (collapsible) ────────────────────────────── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400">
              Shared notes — witnessed arrest
            </p>
            {notesOpen
              ? <ChevronUp className="h-4 w-4 text-slate-500" />
              : <ChevronDown className="h-4 w-4 text-slate-500" />}
          </button>
          {notesOpen && (
            <div className="border-t border-slate-800 px-4 py-3 space-y-2 text-[0.72rem] text-slate-400">
              <p><span className="font-semibold text-slate-300">Definition:</span> Witnessed by Ambulance Service staff during transport/care — not simply reported as witnessed by bystanders.</p>
              <p><span className="font-semibold text-slate-300">Pad position:</span> Anterior–posterior (AP), not anterior–lateral.</p>
              <p><span className="font-semibold text-slate-300">Rhythm rule:</span> Pads not on → CPR first, then attach and analyse. Pads already on → analyse rhythm first.</p>
              <p><span className="font-semibold text-slate-300">Shocks:</span> Single-shock sequence (200 J → 300 J → 360 J) with immediate CPR after each shock and minimal interruptions.</p>
              <p><span className="font-semibold text-slate-300">Non-shockable + IV access:</span> Adrenaline 1 mg IV/IO may be given before airway/LT insertion if compressions are minimally interrupted, then every 4 min.</p>
              <p><span className="font-semibold text-slate-300">Drugs:</span> Adrenaline 1 mg IV/IO ~every 4 min · Amiodarone for refractory VF/VT · H&apos;s &amp; T&apos;s · LUCAS when indicated.</p>
            </div>
          )}
        </section>

        <p className="text-[0.65rem] text-slate-600 pb-2">
          Quick reference only. Always follow current CPG 2.x, device instructions, and Clinical Coordination. Does not replace the full arrest guideline.
        </p>

      </main>
    </div>
  );
}
