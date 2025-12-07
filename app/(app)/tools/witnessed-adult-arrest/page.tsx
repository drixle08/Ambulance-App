"use client";

import Link from "next/link";
import { useState } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

const summaryText =
  "Adult witnessed cardiac arrest (witnessed by Ambulance Service staff during transport/care). Pads in anterior–posterior position. If pads are not attached: start CPR immediately, then attach pads and analyse rhythm as soon as practical. If pads are already on or immediately available: analyse rhythm first, then single shocks for VF/VT with immediate CPR and standard drug schedule, or CPR with early adrenaline for non-shockable rhythms. For non-shockable arrest with IV access, adrenaline 1 mg IV/IO may be given before airway/LT insertion, with ongoing doses every 4 minutes per CPG.";

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

const TWO_RESCUER_STEPS: FlowStep[] = [
  {
    label: "Recognise witnessed arrest & call for help",
    detail:
      "Critical patient already on monitor with AP pads when arrest occurs. Unresponsive with absent or agonal breathing. R1 confirms arrest, calls for help, and notifies NCC / Clinical Coordination.",
    type: "action",
  },
  {
    label: "Analyse rhythm (pads already on)",
    detail:
      "Because AP pads are already attached, R2 pauses briefly to analyse rhythm before the first CPR cycle.",
    type: "decision",
  },
  {
    label: "If VF/VT (shockable)",
    detail:
      "R2 charges the defibrillator while R1 continues chest compressions. Deliver a single shock at the appropriate energy, then immediately resume CPR for 2 minutes (start a 2-minute timer).",
    type: "rhythm",
  },
  {
    label: "If Asystole / PEA (non-shockable)",
    detail:
      "Do not shock. R1 starts CPR immediately and begins a 2-minute timer. If IV/IO access is already in place, adrenaline 1 mg IV/IO may be given early (before airway/LT insertion) with minimal interruption, then continue every 4 minutes as per CPG.",
    type: "rhythm",
  },
  {
    label: "Continue with standard adult arrest algorithm",
    detail:
      "From this point, follow the standard adult cardiac arrest algorithm: 2-minute CPR cycles with rhythm checks, single shocks for VF/VT, ongoing adrenaline schedule, airway strategy, LUCAS, ROSC and termination criteria. R1 focuses on compressions, R2 on defib, drugs and airway.",
    type: "action",
  },
];


const SINGLE_NO_PADS_STEPS: FlowStep[] = [
  {
    label: "Recognise arrest & alert partner / NCC",
    detail:
      "Witnessed collapse with unresponsiveness and absent or agonal breathing. Inform your partner so they can call for help and notify NCC / Clinical Coordination while you stay with the patient.",
    type: "action",
  },
  {
    label: "Immediately prepare and attach pads",
    detail:
      "Retrieve the defibrillator, power it on and apply pads in anterior–lateral position as quickly as possible. Minimise delay but prioritise getting pads on so rhythm can be checked.",
    type: "action",
  },
  {
    label: "Analyse rhythm",
    detail:
      "Once AP pads are attached and connected, briefly pause to analyse rhythm.",
    type: "decision",
  },
  {
    label: "If VF/VT (shockable)",
    detail:
      "Charge while performing chest compressions if safe to do so. Deliver a single shock at the appropriate energy, then immediately resume CPR for 2 minutes (start a 2-minute timer).",
    type: "rhythm",
  },
  {
    label: "If Asystole / PEA (non-shockable)",
    detail:
      "Do not shock. Start or resume CPR immediately and begin a 2-minute timer. Give adrenaline when appropriate as per CPG.",
    type: "rhythm",
  },
  {
    label: "Partner arrives – follow standard adult arrest algorithm",
    detail:
      "By this time your partner should be at your side. Transition into the standard adult cardiac arrest algorithm with two rescuers: 2-minute CPR cycles with rhythm checks, single shocks for VF/VT, drug schedule, airway strategy, LUCAS, ROSC and termination criteria.",
    type: "action",
  },
];

const SINGLE_PADS_ON_STEPS: FlowStep[] = [
  {
    label: "Recognise witnessed arrest & call for help",
    detail:
      "Critical patient already on monitor with AP pads when arrest occurs. Unresponsive with absent or agonal breathing. R1 confirms arrest, calls for help, and notifies NCC / Clinical Coordination.",
  },
  {
    label: "Analyse rhythm first (pads already on)",
    detail:
      "Because AP pads are already attached, briefly pause to analyse rhythm before starting CPR.",
    type: "decision",
  },
  {
    label: "If VF/VT (shockable)",
    detail:
      "Charge and deliver a single shock, then immediately commence CPR for 2 minutes.",
    type: "rhythm",
  },
  {
    label: "If Asystole / PEA (non-shockable)",
    detail:
      "Start CPR for 2 minutes (no shock). If IV/IO access is in place, adrenaline 1 mg may be given early (before airway/LT insertion) with minimal interruption.",
    type: "rhythm",
  },

  {
    label: "Move to multi-rescuer algorithm",
    detail:
      "When crew arrive, transition to the standard adult arrest algorithm: ongoing drug schedule, airway strategy, LUCAS, ROSC and termination criteria as per CPG.",
    type: "action",
  },
];

const SCENARIOS: Scenario[] = [
  {
    id: "two-rescuer",
    title: "Two rescuers – pads already on",
    subtitle:
      "2 AP staff; patient already on monitor with AP pads attached when arrest occurs.",
    steps: TWO_RESCUER_STEPS,
  },
  {
    id: "single-no-pads",
    title: "Single rescuer – pads not attached",
    subtitle: "One AP present, defib in bag, no pads on patient.",
    steps: SINGLE_NO_PADS_STEPS,
  },
  {
    id: "single-pads-on",
    title: "Single rescuer – pads already on",
    subtitle:
      "Critical patient already on monitor with AP pads when arrest occurs.",
    steps: SINGLE_PADS_ON_STEPS,
  },
];


export default function WitnessedAdultArrestPage() {
  const [selectedScenario, setSelectedScenario] =
    useState<ScenarioId>("two-rescuer");

  const activeScenario =
    SCENARIOS.find((s) => s.id === selectedScenario) ?? SCENARIOS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="text-xs font-medium text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400"
        >
          ← Back to dashboard
        </Link>

        <CopySummaryButton summaryText={summaryText} />
      </div>

      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
          Reference
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
          Adult Cardiac Arrest – Witnessed (Ambulance Service)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Diagram-style summary for adult cardiac arrest{" "}
          <span className="font-semibold">
            witnessed by Ambulance Service staff during transport or care
          </span>
          . Shows how to prioritise CPR vs rhythm analysis, AP pad placement, and
          the first cycles for different crew configurations. Always follow the
          full arrest CPG and Clinical Coordination.
        </p>
      </header>

      {/* Shared notes */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
        <p className="text-xs font-semibold tracking-[0.3em] text-slate-700 dark:text-slate-300 uppercase">
          Shared notes – witnessed adult arrest
        </p>
        <ul className="mt-1 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          <li>
            • Definition here is{" "}
            <span className="font-semibold">
              witnessed collapse or arrest by Ambulance Service staff during
              transport/care
            </span>
            , not simply reported as “witnessed” by bystanders.
          </li>
          <li>
            • For these patients, defibrillation pads should be placed in{" "}
            <span className="font-semibold">anterior–posterior (AP)</span>{" "}
            position rather than anterior–lateral.
          </li>
          <li>
            • <span className="font-semibold">Rhythm vs CPR rule:</span>{" "}
            <span className="font-semibold">pads not attached</span> → start CPR
            first, then attach pads and analyse rhythm as soon as practical;{" "}
            <span className="font-semibold">
              pads already on or immediately available
            </span>{" "}
            → analyse rhythm first, then treat based on rhythm.
          </li>
          <li>
            • Defibrillation uses a{" "}
            <span className="font-semibold">single-shock sequence</span> (e.g.
            200 J → 300 J → 360 J) with{" "}
            <span className="font-semibold">
              immediate CPR after each shock
            </span>{" "}
            and minimal interruptions.
          </li>
          <li>
            • Drug timing follows the standard adult arrest algorithm: adrenaline
            1 mg IV/IO roughly every 4 minutes, amiodarone for refractory VF/VT,
            systematic H&apos;s &amp; T&apos;s, and LUCAS when indicated.
          </li>
          <li>
            • In{" "}
            <span className="font-semibold">non-shockable rhythms</span> where
            IV/IO access is already available,{" "}
            <span className="font-semibold">
              adrenaline 1 mg IV/IO may be given before airway / LT insertion
            </span>{" "}
            provided chest compressions are minimally interrupted. Further doses
            then continue every 4 minutes per CPG.
          </li>
        </ul>
      </section>

      {/* Scenario selector + active diagram */}
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((scenario) => {
            const active = scenario.id === selectedScenario;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setSelectedScenario(scenario.id)}
                className={[
                  "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                  active
                    ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                    : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500",
                ].join(" ")}
              >
                {scenario.title}
              </button>
            );
          })}
        </div>

        <ScenarioLane
          title={activeScenario.title}
          subtitle={activeScenario.subtitle}
          steps={activeScenario.steps}
        />
      </section>

      {/* Footer disclaimer */}
      <p className="text-[0.7rem] text-slate-600 dark:text-slate-500 max-w-4xl">
        This witnessed-arrest flow is a simplified text diagram to support crews
        in the back of the truck. It does not replace the full adult cardiac
        arrest, ROSC and termination CPGs, local policies, or Clinical
        Coordination. Always follow your current guideline and device
        instructions.
      </p>
    </div>
  );
}

type ScenarioLaneProps = {
  title: string;
  subtitle: string;
  steps: FlowStep[];
};

function ScenarioLane({ title, subtitle, steps }: ScenarioLaneProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
      <div>
        <p className="text-[0.8rem] font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </p>
        <p className="text-[0.7rem] text-slate-600 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="relative mt-1 pl-3">
        {/* vertical line */}
        <div className="absolute left-[0.55rem] top-1 bottom-1 w-px bg-slate-300 dark:bg-slate-700" />
        <div className="space-y-2">
          {steps.map((step, index) => (
            <FlowStepCard key={index} index={index + 1} step={step} />
          ))}
        </div>
      </div>
    </div>
  );
}

type FlowStepCardProps = {
  index: number;
  step: FlowStep;
};

function FlowStepCard({ index, step }: FlowStepCardProps) {
  const badgeClasses =
    step.type === "decision"
      ? "bg-amber-500 text-slate-950"
      : step.type === "rhythm"
      ? "bg-sky-500 text-slate-950"
      : "bg-emerald-500 text-slate-950";

  return (
    <div className="relative flex gap-2">
      <span
        className={
          "mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-semibold " +
          badgeClasses
        }
      >
        {index}
      </span>
      <div className="flex-1 rounded-lg border border-slate-200 bg-white/80 p-2 dark:border-slate-700 dark:bg-slate-900/80">
        <p className="text-[0.75rem] font-semibold text-slate-900 dark:text-slate-100">
          {step.label}
        </p>
        {step.detail && (
          <p className="mt-0.5 text-[0.7rem] text-slate-700 dark:text-slate-300">
            {step.detail}
          </p>
        )}
      </div>
    </div>
  );
}
