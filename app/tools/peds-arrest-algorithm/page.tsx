"use client";

import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type StepCard = {
  title: string;
  description: string;
};

type CycleCard = {
  title: string;
  badge?: string;
  points: string[];
};

const INITIAL_STEPS: StepCard[] = [
  {
    title: "Recognise paediatric cardiac arrest",
    description:
      "Unresponsive with absent or agonal breathing and no pulse. Consider criteria for undeniable death (CPG 2.7) if appropriate.",
  },
  {
    title: "Start CPR & prepare BVM",
    description:
      "Begin high-quality chest compressions immediately. Prepare BVM.",
  },
  {
    title: "Give 5 BVM breaths, resume CPR & attach pads",
    description:
      "Once BVM is ready, deliver 5 effective breaths via BVM, then resume chest compressions. Attach defibrillation pads/monitor while CPR continues and follow the standard paediatric cardiac arrest algorithm.",
  },
];


const SHOCKABLE_CYCLES: CycleCard[] = [
  {
    title: "Cycle 1 – airway & first shocks",
    badge: "Shock 4 J/kg when VF/VT",
    points: [
      "After rhythm check, if VF/VT, deliver a single shock at 4 J/kg.",
      "Immediately resume CPR for 2 minutes.",
      "Insert SGA early, then maintain continuous compressions with ventilations every 3–5 seconds.",
    ],
  },
  {
    title: "Cycle 2 – IV/IO & reversible causes",
    badge: "Shock 4 J/kg when VF/VT",
    points: [
      "After 2 minutes of CPR, recheck rhythm.",
      "If VF/VT persists, deliver a single shock at 4 J/kg and resume CPR for 2 minutes.",
      "Establish IV/IO access and actively search for reversible causes (H’s and T’s).",
    ],
  },
  {
    title: "Cycle 3 – adrenaline + amiodarone",
    badge: "Shock 4 J/kg when VF/VT",
    points: [
      "After each 2-minute CPR cycle, reassess rhythm and give a single 4 J/kg shock if VF/VT persists.",
      "Epinephrine 0.01 mg/kg (0.1 mL/kg of 1:10,000) IV/IO every 4 minutes.",
      "Amiodarone 5 mg/kg IV/IO for refractory VF/VT as per CPG.",
    ],
  },
  {
    title: "Cycle 4 – further amiodarone & LUCAS",
    badge: "Shock 4 J/kg when VF/VT",
    points: [
      "Continue 2-minute CPR cycles with rhythm checks and single shocks at 4 J/kg when VF/VT persists.",
      "Repeat amiodarone 5 mg/kg as per CPG if still in refractory VF/VT.",
      "Prepare LUCAS (if applicable and patient size/weight is suitable) while maintaining compressions.",
    ],
  },
];

const NON_SHOCKABLE_CYCLES: CycleCard[] = [
  {
    title: "Cycle 1 – airway",
    points: [
      "If asystole/PEA, do not shock.",
      "Continue CPR for 2 minutes.",
      "Insert SGA then maintain continuous compressions with ventilations every 3–5 seconds.",
    ],
  },
  {
    title: "Cycle 2 – IV/IO & adrenaline",
    points: [
      "Maintain 2-minute CPR cycles.",
      "Obtain IV/IO access if not already in place.",
      "Epinephrine 0.01 mg/kg (0.1 mL/kg of 1:10,000) IV/IO every 4 minutes.",
    ],
  },
  {
    title: "Cycle 3 – reversible causes",
    points: [
      "Continue 2-minute CPR cycles with rhythm reassessment.",
      "Actively search for and treat reversible causes (H’s and T’s).",
    ],
  },
  {
    title: "Cycle 4 – ongoing adrenaline & LUCAS",
    points: [
      "Keep giving epinephrine 0.01 mg/kg IV/IO every 4 minutes.",
      "Prepare LUCAS if applicable and size/weight allow, while maintaining compressions.",
    ],
  },
];

const summaryText =
  "Paediatric cardiac arrest algorithm: start CPR and BVM, attach defibrillator, then 2-minute CPR cycles with rhythm checks. Deliver single shocks at 4 J/kg for VF/VT, give epinephrine 0.01 mg/kg IV/IO every 4 minutes, amiodarone 5 mg/kg for refractory VF/VT, early SGA and reversible causes, and do not terminate resuscitation in the field – transport with CPR in progress.";

export default function PedsArrestAlgorithmPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="text-xs font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
        >
          ← Back to dashboard
        </Link>
        <CopySummaryButton summaryText={summaryText} />
      </div>

      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
          Resuscitation
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
          Paediatric Cardiac Arrest Algorithm
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Diagram-style reference for paediatric cardiac arrest based on the
          updated HMCAS cardiac arrest algorithm. Use alongside your paediatric
          arrest drug calculator (WAAFELSS) and the full CPG. All doses and
          decisions must be confirmed with CPG 2.x before clinical use.
        </p>
      </header>

      {/* Initial steps */}
      <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase mb-2">
              Initial recognition & setup
            </p>
            <div className="space-y-2">
              {INITIAL_STEPS.map((step, idx) => (
                <div
                  key={step.title}
                  className="flex gap-3 rounded-xl bg-slate-100 border border-slate-200 p-3 dark:bg-slate-900/70 dark:border-slate-800"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Undeniable death note */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-1">
            No resuscitation criteria
          </p>
          <p>
            If the child meets{" "}
            <span className="font-semibold">undeniable death</span> criteria,
            follow CPG 2.7 and do not commence resuscitation. Otherwise, proceed
            with the paediatric cardiac arrest algorithm.
          </p>
        </div>
      </section>

      {/* Rhythm branches */}
      <section className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-100">
            Rhythm shockable?
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Shockable side */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs font-semibold tracking-[0.3em] text-amber-500 uppercase">
              VF/VT (shockable)
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              For each 2-minute CPR cycle, if VF/VT is present at rhythm check,
              deliver a <span className="font-semibold">single shock 4 J/kg</span>, then
              immediately resume CPR for 2 minutes.
            </p>
            <div className="space-y-2">
              {SHOCKABLE_CYCLES.map((cycle, idx) => (
                <div
                  key={cycle.title}
                  className="rounded-xl bg-slate-100 border border-slate-200 p-3 dark:bg-slate-900/70 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {idx + 1}. {cycle.title}
                    </p>
                    {cycle.badge && (
                      <span className="ml-2 inline-flex items-center rounded-full border border-amber-400/70 bg-amber-400/10 px-2 py-0.5 text-[0.65rem] font-medium text-amber-600 dark:text-amber-200">
                        {cycle.badge}
                      </span>
                    )}
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {cycle.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="mt-[0.3rem] h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Non-shockable side */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">
              Asystole / PEA (non-shockable)
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              If rhythm is not shockable,{" "}
              <span className="font-semibold">do not shock</span>. Maintain
              continuous 2-minute CPR cycles with rhythm checks, airway
              management, adrenaline, and reversible causes.
            </p>
            <div className="space-y-2">
              {NON_SHOCKABLE_CYCLES.map((cycle, idx) => (
                <div
                  key={cycle.title}
                  className="rounded-xl bg-slate-100 border border-slate-200 p-3 dark:bg-slate-900/70 dark:border-slate-800"
                >
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {idx + 1}. {cycle.title}
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {cycle.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="mt-[0.3rem] h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROSC section */}
      <section className="space-y-3">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center rounded-full bg-amber-400 px-4 py-1 text-xs font-semibold text-slate-900">
            ROSC?
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
            <p className="text-[0.7rem] font-semibold text-blue-600 dark:text-blue-300 mb-1">
              YES – sustained ROSC
            </p>
            <p>
              Manage according to <span className="font-semibold">ROSC CPG 2.6</span> for
              paediatric patients. Optimise oxygenation, ventilation, blood
              pressure and temperature, and{" "}
              <span className="font-semibold">consider early transport</span> to
              an appropriate facility.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
            <p className="text-[0.7rem] font-semibold text-orange-500 mb-1">
              NO – continue resuscitation
            </p>
            <p>
              Continue 2-minute CPR cycles with rhythm checks. For VF/VT, keep
              delivering single 4 J/kg shocks with adrenaline and amiodarone as
              per CPG. For asystole/PEA, focus on high-quality CPR, adrenaline
              and reversible causes.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
            <p className="text-[0.7rem] font-semibold text-rose-500 mb-1">
              NO – field termination?
            </p>
            <p>
              <span className="font-semibold">
                Termination of paediatric resuscitation should not occur in the
                field.
              </span>{" "}
              Continue resuscitation and{" "}
              <span className="font-semibold">
                transport to an appropriate facility with CPR in progress
              </span>{" "}
              in line with local CPG and Clinical Coordination.
            </p>
          </div>
        </div>
      </section>

      <p className="text-[0.7rem] text-slate-500 dark:text-slate-500">
        This reference is a visual aid only. Always follow the current HMCAS
        Clinical Practice Guidelines and directions from Clinical Coordination
        when managing paediatric cardiac arrest.
      </p>
    </div>
  );
}
