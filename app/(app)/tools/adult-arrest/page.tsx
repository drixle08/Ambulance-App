// TEMP TEST CHANGE
"use client";

import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";


const summaryText =
  "Adult unwitnessed cardiac arrest – followed updated HMCAS arrest algorithm: assess for undeniable death (CPG 2.7) then start CPR, attach defibrillator/monitor and assess rhythm. For VF/VT: shocks 200 J, then 300 J, then 360 J with 2-min CPR cycles, SGA with continuous compressions, IV/IO access, reversible causes (H’s & T’s), adrenaline 1 mg every 4 min, amiodarone 300 mg then 150 mg, and LUCAS when available. For asystole/PEA: 2-min CPR cycles with SGA, early adrenaline 1 mg then 1 mg every 4 min, reversible causes and LUCAS preparation. ROSC → CPG 2.6; consider termination as per CPG 2.7.";

export default function AdultArrestReferencePage() {
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
          Adult Cardiac Arrest (Unwitnessed)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Text-based summary of the updated adult unwitnessed cardiac arrest
          algorithm used in HMCAS. This is a quick reference to support what you
          already know from CPG 2.x – it does not replace the full arrest
          guideline, local LUCAS protocols, or Clinical Coordination.
        </p>
      </header>

      {/* Initial entry + rhythm assessment */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
            1. Entry criteria
          </p>
          <ul className="mt-1 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <li>• Unresponsive with absent or agonal breathing.</li>
            <li>• Confirm arrest quickly – no normal pulse or breathing.</li>
          </ul>
          <div className="mt-3 rounded-xl border border-slate-300 bg-slate-100 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/70">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              Undeniable death?
            </p>
            <p className="mt-1 text-[0.7rem] text-slate-700 dark:text-slate-300">
              If features of undeniable death are present,{" "}
              <span className="font-semibold">
                do not commence resuscitation – see CPG 2.7.
              </span>
              {"  "}
              Otherwise, proceed with CPR and defibrillator attachment.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
            2. Start CPR & assess rhythm
          </p>
          <ul className="mt-1 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <li>• START CPR immediately.</li>
            <li>• Attach defibrillator / monitor as soon as safe.</li>
            <li>• Continue compressions with minimal interruptions.</li>
            <li>• Assess rhythm as soon as pads are on.</li>
          </ul>
          <p className="mt-2 text-[0.7rem] text-slate-600 dark:text-slate-400">
            Rhythm assessment leads to two main pathways:{" "}
            <span className="font-semibold">shockable (VF/VT)</span> or{" "}
            <span className="font-semibold">non-shockable (asystole/PEA).</span>
          </p>
        </div>
      </section>

      {/* Shockable vs non-shockable columns */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Shockable pathway */}
        <div className="rounded-2xl border border-amber-400/60 bg-amber-50 p-4 space-y-3 dark:border-amber-500/60 dark:bg-amber-500/5">
          <p className="text-xs font-semibold tracking-[0.3em] text-amber-700 dark:text-amber-300 uppercase">
            Shockable rhythm – VF/VT
          </p>
          <p className="text-xs text-amber-900 dark:text-amber-100">
            Aim for 2-minute CPR cycles with early shocks and minimal pauses.
          </p>

          <StepCard
            title="First cycle"
            subtitle="Initial shock & airway"
            items={[
              "Deliver first shock 200 J (biphasic).",
              "Resume CPR immediately for 2 minutes.",
              "Insert SGA when able, then move to continuous compressions.",
              "Ventilate every 6–8 seconds (about 10 breaths/min).",
            ]}
          />

          <StepCard
            title="Second cycle"
            subtitle="Higher energy & access"
            items={[
              "Reassess rhythm – if still VF/VT, deliver second shock 300 J.",
              "Resume CPR for 2 minutes.",
              "Establish IV/IO access.",
              "Look for reversible causes (H’s & T’s).",
            ]}
          />

          <StepCard
            title="Third cycle"
            subtitle="Adrenaline & amiodarone"
            items={[
              "Reassess rhythm – if still VF/VT, deliver shock 360 J.",
              "Continue 2-minute CPR cycles between checks.",
              "Adrenaline 1 mg IV/IO every 4 minutes.",
              "Amiodarone 300 mg IV/IO bolus.",
              "Consider A-P / DSED pad placement and prepare LUCAS device.",
            ]}
          />

          <StepCard
            title="Ongoing cycles"
            subtitle="Further antiarrhythmic & LUCAS"
            items={[
              "Further shocks at 360 J if VF/VT persists.",
              "Continue adrenaline 1 mg every 4 minutes.",
              "Give amiodarone 150 mg as per CPG (repeat dose).",
              "Apply LUCAS and move to continuous mode if available.",
              "Keep reassessing rhythm and reversible causes.",
            ]}
          />
        </div>

        {/* Non-shockable pathway */}
        <div className="rounded-2xl border border-sky-400/60 bg-sky-50 p-4 space-y-3 dark:border-sky-500/60 dark:bg-sky-500/5">
          <p className="text-xs font-semibold tracking-[0.3em] text-sky-800 dark:text-sky-200 uppercase">
            Non-shockable rhythm – Asystole / PEA
          </p>
          <p className="text-xs text-sky-900 dark:text-sky-100">
            No shocks. Focus on high-quality CPR, early adrenaline and
            reversible causes.
          </p>

          <StepCard
            title="First cycles"
            subtitle="Airway & initial adrenaline"
            items={[
              "2-minute CPR cycles with minimal pauses.",
              "Insert SGA when able, then continuous compressions.",
              "Ventilate every 6–8 seconds.",
              "Obtain IV/IO access.",
              "Give adrenaline 1 mg IV/IO as soon as possible.",
            ]}
          />

          <StepCard
            title="Ongoing cycles"
            subtitle="Reversible causes & LUCAS"
            items={[
              "Continue 2-minute CPR cycles – no shocks.",
              "Adrenaline 1 mg IV/IO every 4 minutes.",
              "Systematically search for reversible causes (H’s & T’s).",
              "Prepare or apply LUCAS and switch to continuous mode when ready.",
              "Reassess rhythm and signs of ROSC at the end of each cycle.",
            ]}
          />
        </div>
      </section>

      {/* ROSC / termination */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-emerald-500/60 bg-emerald-50 p-4 space-y-2 dark:border-emerald-500/70 dark:bg-emerald-500/5">
          <p className="text-xs font-semibold tracking-[0.3em] text-emerald-700 dark:text-emerald-200 uppercase">
            ROSC pathway
          </p>
          <p className="text-xs text-emerald-900 dark:text-emerald-100">
            When clear signs of ROSC are present:
          </p>
          <ul className="mt-1 space-y-1.5 text-xs text-emerald-900 dark:text-emerald-100">
            <li>• Transition to post-ROSC care as per CPG 2.6.</li>
            <li>• Focus on airway, ventilation, blood pressure and temperature.</li>
            <li>• Prepare for transport to an appropriate facility with prenotification.</li>
          </ul>
        </div>

        <div className="md:col-span-1 rounded-2xl border border-slate-300 bg-slate-50 p-4 space-y-2 dark:border-slate-700 dark:bg-slate-950/60">
          <p className="text-xs font-semibold tracking-[0.3em] text-slate-700 dark:text-slate-300 uppercase">
            Consider termination
          </p>
          <p className="text-[0.7rem] text-slate-700 dark:text-slate-300">
            If there is no ROSC despite ongoing high-quality resuscitation,
            follow{" "}
            <span className="font-semibold">
              CPG 2.7 – Consider terminating resuscitation
            </span>{" "}
            and involve Clinical Coordination / duty officer as required.
          </p>
        </div>
      </section>

      {/* Footer disclaimer */}
      <p className="text-[0.7rem] text-slate-600 dark:text-slate-500 max-w-4xl">
        This card is a teaching and quick-reference summary of the updated adult
        unwitnessed cardiac arrest algorithm. It simplifies the full HMCAS
        cardiac arrest guidelines (CPG 2.x, including ROSC and termination
        pathways) and does not replace them. Always follow your current CPG,
        device-specific instructions and Clinical Coordination advice.
      </p>
    </div>
  );
}

type StepCardProps = {
  title: string;
  subtitle?: string;
  items: string[];
};

function StepCard({ title, subtitle, items }: StepCardProps) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/60 p-3 text-xs text-slate-800 shadow-sm dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-200">
      <p className="text-[0.75rem] font-semibold">{title}</p>
      {subtitle && (
        <p className="text-[0.7rem] text-slate-600 dark:text-slate-400">
          {subtitle}
        </p>
      )}
      <ul className="mt-1.5 space-y-1.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="mt-[0.3rem] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
